import { useEffect, useState } from 'react';
import { SelectItem } from '@mantine/core';
import isElectron from 'is-electron';
import { Checkbox, Select, Slider, toast } from '/@/renderer/components';
import {
    SettingsSection,
    SettingOption,
} from '/@/renderer/features/settings/components/settings-section';
import { useCurrentStatus, usePlayerStore } from '/@/renderer/store';
import { usePlaybackSettings, useSettingsStoreActions } from '/@/renderer/store/settings.store';
import { PlaybackType, PlayerStatus, PlaybackStyle, CrossfadeStyle } from '/@/renderer/types';
import { useTranslation } from 'react-i18next';

const mpvPlayer = isElectron() ? window.electron.mpvPlayer : null;
const localSettings = isElectron() ? window.electron.localSettings : null;

const getAudioDevice = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return (devices || []).filter((dev: MediaDeviceInfo) => dev.kind === 'audiooutput');
};

const initialDisable = (localSettings?.get('disable_mpv') as boolean | undefined) ?? false;

export const AudioSettings = () => {
    const { t } = useTranslation();
    const settings = usePlaybackSettings();
    const { setSettings } = useSettingsStoreActions();
    const status = useCurrentStatus();

    const [audioDevices, setAudioDevices] = useState<SelectItem[]>([]);
    const [disableMpv, setDisableMpv] = useState(initialDisable);

    const handleSetDisableMpv = (disabled: boolean) => {
        setDisableMpv(disabled);
        localSettings?.set('disable_mpv', disabled);

        if (disabled) {
            setSettings({
                playback: { ...settings, type: disabled ? PlaybackType.WEB : PlaybackType.LOCAL },
            });
        }
    };

    useEffect(() => {
        const getAudioDevices = () => {
            getAudioDevice()
                .then((dev) =>
                    setAudioDevices(dev.map((d) => ({ label: d.label, value: d.deviceId }))),
                )
                .catch(() =>
                    toast.error({
                        message: t('error.audioDeviceFetchError', { postProcess: 'sentenceCase' }),
                    }),
                );
        };

        if (settings.type === PlaybackType.WEB) {
            getAudioDevices();
        }
    }, [settings.type, t]);

    const audioOptions: SettingOption[] = [
        {
            control: (
                <Checkbox
                    defaultChecked={disableMpv}
                    onChange={(e) => handleSetDisableMpv(e.currentTarget.checked)}
                />
            ),
            description: t('setting.disableMpv', { context: 'description' }),
            isHidden: !isElectron(),
            note: t('common.restartRequired', { postProcess: 'sentenceCase' }),
            title: t('setting.disableMpv'),
        },
        {
            control: (
                <Select
                    data={[
                        {
                            disabled: !isElectron(),
                            label: 'MPV',
                            value: PlaybackType.LOCAL,
                        },
                        { label: 'Web', value: PlaybackType.WEB },
                    ]}
                    defaultValue={settings.type}
                    disabled={status === PlayerStatus.PLAYING}
                    onChange={(e) => {
                        setSettings({ playback: { ...settings, type: e as PlaybackType } });
                        if (isElectron() && e === PlaybackType.LOCAL) {
                            const queueData = usePlayerStore.getState().actions.getPlayerData();
                            mpvPlayer!.setQueue(queueData);
                        }
                    }}
                />
            ),
            description: t('setting.audioPlayer', {
                context: 'description',
                postProcess: 'sentenceCase',
            }),
            isHidden: !isElectron() || initialDisable || disableMpv,
            note:
                status === PlayerStatus.PLAYING
                    ? t('common.playerMustBePaused', { postProcess: 'sentenceCase' })
                    : undefined,
            title: t('setting.audioPlayer', { postProcess: 'sentenceCase' }),
        },
        {
            control: (
                <Select
                    clearable
                    data={audioDevices}
                    defaultValue={settings.audioDeviceId}
                    disabled={settings.type !== PlaybackType.WEB}
                    onChange={(e) => setSettings({ playback: { ...settings, audioDeviceId: e } })}
                />
            ),
            description: t('setting.audioDevice', {
                context: 'description',
                postProcess: 'sentenceCase',
            }),
            isHidden: !isElectron() || settings.type !== PlaybackType.WEB,
            title: t('setting.audioDevice', { postProcess: 'sentenceCase' }),
        },
        {
            control: (
                <Select
                    data={[
                        {
                            label: t('setting.playbackStyle', {
                                context: 'optionNormal',
                                postProcess: 'titleCase',
                            }),
                            value: PlaybackStyle.GAPLESS,
                        },
                        {
                            label: t('setting.playbackStyle', {
                                context: 'optionCrossFade',
                                postProcess: 'titleCase',
                            }),
                            value: PlaybackStyle.CROSSFADE,
                        },
                    ]}
                    defaultValue={settings.style}
                    disabled={settings.type !== PlaybackType.WEB || status === PlayerStatus.PLAYING}
                    onChange={(e) =>
                        setSettings({ playback: { ...settings, style: e as PlaybackStyle } })
                    }
                />
            ),
            description: t('setting.playbackStyle', {
                context: 'description',
                postProcess: 'sentenceCase',
            }),
            isHidden: settings.type !== PlaybackType.WEB,
            note: status === PlayerStatus.PLAYING ? 'Player must be paused' : undefined,
            title: t('setting.playbackStyle', {
                context: 'description',
                postProcess: 'sentenceCase',
            }),
        },
        {
            control: (
                <Slider
                    defaultValue={settings.crossfadeDuration}
                    disabled={
                        settings.type !== PlaybackType.WEB ||
                        settings.style !== PlaybackStyle.CROSSFADE ||
                        status === PlayerStatus.PLAYING
                    }
                    max={15}
                    min={0}
                    w={100}
                    onChangeEnd={(e) =>
                        setSettings({ playback: { ...settings, crossfadeDuration: e } })
                    }
                />
            ),
            description: t('setting.crossfadeDuration', {
                context: 'description',
                postProcess: 'sentenceCase',
            }),
            isHidden: settings.type !== PlaybackType.WEB,
            note: status === PlayerStatus.PLAYING ? 'Player must be paused' : undefined,
            title: t('setting.crossfadeDuration', {
                postProcess: 'sentenceCase',
            }),
        },
        {
            control: (
                <Select
                    data={[
                        { label: 'Linear', value: CrossfadeStyle.LINEAR },
                        { label: 'Constant Power', value: CrossfadeStyle.CONSTANT_POWER },
                        {
                            label: 'Constant Power (Slow cut)',
                            value: CrossfadeStyle.CONSTANT_POWER_SLOW_CUT,
                        },
                        {
                            label: 'Constant Power (Slow fade)',
                            value: CrossfadeStyle.CONSTANT_POWER_SLOW_FADE,
                        },
                        { label: 'Dipped', value: CrossfadeStyle.DIPPED },
                        { label: 'Equal Power', value: CrossfadeStyle.EQUALPOWER },
                    ]}
                    defaultValue={settings.crossfadeStyle}
                    disabled={
                        settings.type !== PlaybackType.WEB ||
                        settings.style !== PlaybackStyle.CROSSFADE ||
                        status === PlayerStatus.PLAYING
                    }
                    width={200}
                    onChange={(e) => {
                        if (!e) return;
                        setSettings({
                            playback: { ...settings, crossfadeStyle: e as CrossfadeStyle },
                        });
                    }}
                />
            ),
            description: t('setting.crossfadeStyle', {
                context: 'description',
                postProcess: 'sentenceCase',
            }),
            isHidden: settings.type !== PlaybackType.WEB,
            note: status === PlayerStatus.PLAYING ? 'Player must be paused' : undefined,
            title: t('setting.crossfadeStyle', { postProcess: 'sentenceCase' }),
        },
    ];

    return <SettingsSection options={audioOptions} />;
};

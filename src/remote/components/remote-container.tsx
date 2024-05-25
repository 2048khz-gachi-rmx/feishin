import { useCallback } from 'react';
import { Group, Image, Text, Title } from '@mantine/core';
import { useInfo, useSend, useShowImage } from '/@/remote/store';
import { RemoteButton } from '/@/remote/components/buttons/remote-button';
import formatDuration from 'format-duration';
import debounce from 'lodash/debounce';
import {
    RiHeartLine,
    RiPauseFill,
    RiPlayFill,
    RiRepeat2Line,
    RiRepeatOneLine,
    RiShuffleFill,
    RiSkipBackFill,
    RiSkipForwardFill,
    RiVolumeUpFill,
} from 'react-icons/ri';
import { PlayerRepeat, PlayerStatus } from '/@/renderer/types';
import { WrapperSlider } from '/@/remote/components/wrapped-slider';
import { Tooltip } from '/@/renderer/components/tooltip';
import { Rating } from '/@/renderer/components';

export const RemoteContainer = () => {
    const { repeat, shuffle, song, status, volume } = useInfo();
    const send = useSend();
    const showImage = useShowImage();

    const id = song?.id;

    const setRating = useCallback(
        (rating: number) => {
            send({ event: 'rating', id: id!, rating });
        },
        [send, id],
    );

    const debouncedSetRating = debounce(setRating, 400);

    return (
        <>
            {song && (
                <>
                    <Title order={1}>{song.name}</Title>
                    <Group align="flex-end">
                        <Title order={2}>Album: {song.album}</Title>
                        <Title order={2}>Artist: {song.artistName}</Title>
                    </Group>
                    <Group justify="space-between">
                        <Title order={3}>Duration: {formatDuration(song.duration)}</Title>
                        {song.releaseDate && (
                            <Title order={3}>
                                Released: {new Date(song.releaseDate).toLocaleDateString()}
                            </Title>
                        )}
                        <Title order={3}>Plays: {song.playCount}</Title>
                    </Group>
                </>
            )}
            <Group
                grow
                gap={0}
            >
                <RemoteButton
                    disabled={!song}
                    tooltip="Previous track"
                    variant="default"
                    onClick={() => send({ event: 'previous' })}
                >
                    <RiSkipBackFill size={25} />
                </RemoteButton>
                <RemoteButton
                    disabled={!song}
                    tooltip={song && status === PlayerStatus.PLAYING ? 'Pause' : 'Play'}
                    variant="default"
                    onClick={() => {
                        if (status === PlayerStatus.PLAYING) {
                            send({ event: 'pause' });
                        } else if (status === PlayerStatus.PAUSED) {
                            send({ event: 'play' });
                        }
                    }}
                >
                    {song && status === PlayerStatus.PLAYING ? (
                        <RiPauseFill size={25} />
                    ) : (
                        <RiPlayFill size={25} />
                    )}
                </RemoteButton>
                <RemoteButton
                    disabled={!song}
                    tooltip="Next track"
                    variant="default"
                    onClick={() => send({ event: 'next' })}
                >
                    <RiSkipForwardFill size={25} />
                </RemoteButton>
            </Group>
            <Group
                grow
                gap={0}
            >
                <RemoteButton
                    $active={shuffle || false}
                    tooltip={shuffle ? 'Shuffle tracks' : 'Shuffle disabled'}
                    variant="default"
                    onClick={() => send({ event: 'shuffle' })}
                >
                    <RiShuffleFill size={25} />
                </RemoteButton>
                <RemoteButton
                    $active={repeat !== undefined && repeat !== PlayerRepeat.NONE}
                    tooltip={`Repeat ${
                        repeat === PlayerRepeat.ONE
                            ? 'One'
                            : repeat === PlayerRepeat.ALL
                            ? 'all'
                            : 'none'
                    }`}
                    variant="default"
                    onClick={() => send({ event: 'repeat' })}
                >
                    {repeat === undefined || repeat === PlayerRepeat.ONE ? (
                        <RiRepeatOneLine size={25} />
                    ) : (
                        <RiRepeat2Line size={25} />
                    )}
                </RemoteButton>
                <RemoteButton
                    $active={song?.userFavorite}
                    disabled={!song}
                    tooltip={song?.userFavorite ? 'Unfavorite' : 'Favorite'}
                    variant="default"
                    onClick={() => {
                        if (!id) return;

                        send({ event: 'favorite', favorite: !song.userFavorite, id });
                    }}
                >
                    <RiHeartLine size={25} />
                </RemoteButton>
                {(song?.serverType === 'navidrome' || song?.serverType === 'subsonic') && (
                    <div style={{ margin: 'auto' }}>
                        <Tooltip
                            label="Double click to clear"
                            openDelay={1000}
                        >
                            <Rating
                                style={{ margin: 'auto' }}
                                value={song.userRating ?? 0}
                                onChange={debouncedSetRating}
                                onDoubleClick={() => debouncedSetRating(0)}
                            />
                        </Tooltip>
                    </div>
                )}
            </Group>
            <WrapperSlider
                leftLabel={<RiVolumeUpFill size={20} />}
                max={100}
                rightLabel={
                    <Text
                        fw={600}
                        size="xs"
                    >
                        {volume ?? 0}
                    </Text>
                }
                value={volume ?? 0}
                onChangeEnd={(e) => send({ event: 'volume', volume: e })}
            />
            {showImage && (
                <Image
                    src={song?.imageUrl?.replaceAll(/&(size|width|height=\d+)/g, '')}
                    onError={() => send({ event: 'proxy' })}
                />
            )}
        </>
    );
};

import clsx from 'clsx';
import { useMemo } from 'react';

import styles from './lyrics-scroll-content.module.css';

export interface LyricsScrollContentProps {
    bottomScrollPadding?: string;
    children: React.ReactNode;
    className?: string;
    gap?: number;
    paddingLeft?: number;
    paddingRight?: number;
    preview?: boolean;
    style?: React.CSSProperties;
}

export const LyricsScrollContent = ({
    bottomScrollPadding = '50vh',
    children,
    className,
    gap,
    paddingLeft = 0,
    paddingRight = 0,
    preview = false,
    style,
}: LyricsScrollContentProps) => {
    // Flex `gap` cannot be negative, so a negative gap is applied as a negative
    // margin on each line (except the last) instead.
    const negativeGap = gap !== undefined && gap < 0;

    const contentStyle = useMemo(() => {
        const gapStyle: React.CSSProperties = {
            '--lyric-negative-gap': negativeGap ? `${gap}px` : undefined,
            gap: !negativeGap && gap !== undefined ? `${gap}px` : undefined,
        } as React.CSSProperties;

        if (preview) {
            return {
                ...gapStyle,
                padding: 0,
                ...style,
            } as React.CSSProperties;
        }

        return {
            '--lyric-padding-left': `${paddingLeft}%`,
            '--lyric-padding-right': `${paddingRight}%`,
            ...gapStyle,
            paddingBottom: bottomScrollPadding,
            paddingLeft: `${paddingLeft}%`,
            paddingRight: `${paddingRight}%`,
            paddingTop: '10vh',
            ...style,
        } as React.CSSProperties;
    }, [bottomScrollPadding, gap, negativeGap, paddingLeft, paddingRight, preview, style]);

    return (
        <div
            className={clsx(
                styles.content,
                negativeGap && styles.negativeGap,
                preview && styles.preview,
                className,
            )}
            style={contentStyle}
        >
            {children}
        </div>
    );
};

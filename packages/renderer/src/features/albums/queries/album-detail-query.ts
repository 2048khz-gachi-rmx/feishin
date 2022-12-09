import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '/@/api/query-keys';
import type { QueryOptions } from '/@/lib/react-query';
import { useCurrentServer } from '../../../store/auth.store';
import type { AlbumDetailQuery } from '/@/api/types';
import { controller } from '/@/api/controller';

export const useAlbumDetail = (query: AlbumDetailQuery, options: QueryOptions) => {
  const server = useCurrentServer();

  return useQuery({
    queryFn: ({ signal }) => controller.getAlbumDetail({ query, server, signal }),
    queryKey: queryKeys.albums.detail(server?.id || '', query),
    ...options,
  });
};

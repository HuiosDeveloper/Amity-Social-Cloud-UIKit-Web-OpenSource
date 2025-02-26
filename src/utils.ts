import { Client as ASCClient, SubscriptionLevels } from '@amityco/ts-sdk';
import { Permissions } from './social/constants';

export function isLoadingItem<T>(item: T | { skeleton?: boolean }): item is { skeleton?: boolean } {
  return !!(item as { skeleton?: boolean }).skeleton;
}

export function isValidHttpUrl(url: string) {
  try {
    const newUrl = new URL(url);
    return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

export const checkStoryPermission = (
  client: Amity.Client | null | undefined,
  communityId?: string,
): boolean => {
  if (!client) {
    return false;
  }

  const userPermission = client.hasPermission(Permissions.ManageStoryPermission).currentUser();

  if (userPermission) {
    return true;
  }

  if (communityId) {
    const communityPermission = client
      .hasPermission(Permissions.ManageStoryPermission)
      .community(communityId);
    return communityPermission;
  }

  return false;
};

export function formatTimeAgo(dateString: string | Date | undefined) {
  if (!dateString) return;
  const givenDate = new Date(dateString);
  const currentDate = new Date();

  const timeDifferenceInSeconds = Math.floor((currentDate.getTime() - givenDate.getTime()) / 1000);

  if (timeDifferenceInSeconds < 60) {
    return 'Just now';
  } else if (timeDifferenceInSeconds >= 60 && timeDifferenceInSeconds < 3600) {
    const minutes = Math.floor(timeDifferenceInSeconds / 60);
    return `${minutes}m`;
  } else {
    const hours = Math.floor(timeDifferenceInSeconds / 3600);
    return `${hours}h`;
  }
}

const getCommunityUserTopic = (
  path: Amity.Subscribable['path'],
  level?: SubscriptionLevels,
): string => {
  switch (level) {
    case 'post':
      return `${path}/post/+`;
    case 'comment':
      return `${path}/post/+/comment/+`;
    case 'post_and_comment':
      return `${path}/post/#`;
    default:
      return path;
  }
};

const getNetworkId = (user: { path: string }): string => user.path.split('/user/')[0];

export const getCommunityTopic = (
  { path }: Amity.Subscribable,
  level: Exclude<SubscriptionLevels, SubscriptionLevels.USER> = SubscriptionLevels.COMMUNITY,
): string => getCommunityUserTopic(path, level);

export const getUserTopic = (
  { path }: Amity.Subscribable,
  level: Exclude<SubscriptionLevels, SubscriptionLevels.COMMUNITY> = SubscriptionLevels.USER,
): string =>
  getCommunityUserTopic(
    level === SubscriptionLevels.USER ? path : path.replace(/^(\w*)/, '$1/social'),
    level,
  );

export const getPostTopic = (
  { path }: Amity.Subscribable,
  level: SubscriptionLevels.POST | SubscriptionLevels.COMMENT = SubscriptionLevels.POST,
): string => {
  switch (level) {
    case 'comment':
      return `${path}/comment/+`;
    default:
      return path;
  }
};

export const getCommentTopic = ({ path }: Amity.Subscribable): string => {
  return path;
};

export const getFollowersTopic = (user: Amity.User): string => {
  return `${getNetworkId(user)}/membership/${user._id}/+/+`;
};

export const getFollowingsTopic = (user: Amity.User): string => {
  return `${getNetworkId(user)}/membership/+/${user._id}/+`;
};

export const getChannelTopic = (channel: Amity.Subscribable): string => `${channel.path}/#`;

export const getSubChannelTopic = (subChannel: Amity.Subscribable): string =>
  `${subChannel.path}/#`;

export const getMessageTopic = (message: Amity.Subscribable): string => message.path;

export const getMarkedMessageTopic = ({
  channelId,
  subChannelId,
}: Pick<Amity.SubChannel, 'channelId' | 'subChannelId'>): string => {
  const user = ASCClient.getActiveUser();

  return `${getNetworkId(user)}/marker/channel/${channelId}/message/${subChannelId}`;
};

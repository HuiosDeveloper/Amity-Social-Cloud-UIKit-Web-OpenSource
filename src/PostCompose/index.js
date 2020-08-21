import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import { customizableComponent } from '../hoks/customization';
import { notification } from '../commonComponents/Notification';
import Files from '../Files';
import Images from '../Images';

import Popover from '../commonComponents/Popover/';
import Menu, { MenuItem } from '../commonComponents/Menu';

import { testUser, testFiles, testImages } from '../mock';

import {
  AuthorSelectorContainer,
  CommunitySeparator,
  PostComposeContainer,
  PostComposeTextarea,
  PostComposeTextareaWrapper,
  ImagePostIcon,
  FilePostIcon,
  SelectIcon,
  Footer,
  FooterActionBar,
  PostContainer,
  PostButton,
  Avatar,
  PostAsCommunityContainer,
  Checkbox,
  Caption,
} from './styles';

const MAX_IMAGES = 10;
const MAX_FILES = 10;

const PostAsCommunity = ({ value, onChange }) => (
  <PostAsCommunityContainer>
    <Checkbox checked={value} onChange={e => onChange(e.target.checked)} />
    <div>
      Post as community
      <Caption>Enable this will publish the post on behalf of community account</Caption>
    </div>
  </PostAsCommunityContainer>
);

const isIdenticalAuthor = (a, b) =>
  !!a &&
  !!b &&
  ((!!a.userId && a.userId == b.userId) || (!!a.communityId && a.communityId == b.communityId));

const maxImagesWarning = () =>
  notification.info({
    content: 'You reached the maximum attachment of 10',
  });

const maxFilesWarning = () =>
  notification.info({
    content: 'The selected file is larger than 1GB. Plese select a new file. ',
  });

const AuthorSelector = ({ author, user, communities, onChange }) => {
  if (!communities || !communities.length) return <Avatar avatar={author.avatar} />;

  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const menu = (
    <Menu>
      <MenuItem
        onClick={() => {
          onChange(user);
          close();
        }}
      >
        <Avatar size="tiny" avatar={user.avatar} /> My Timeline
      </MenuItem>
      <CommunitySeparator>Community</CommunitySeparator>
      {communities.map(community => (
        <MenuItem
          active={author.communityId === community.communityId}
          onClick={() => {
            onChange(community);
            close();
          }}
        >
          <Avatar avatar={community.avatar} size="tiny" /> {community.name}
        </MenuItem>
      ))}
    </Menu>
  );

  return (
    <div>
      <Popover
        isOpen={isOpen}
        onClickOutside={close}
        position="bottom"
        align="start"
        content={menu}
      >
        <AuthorSelectorContainer onClick={open}>
          <Avatar avatar={author.avatar} /> <SelectIcon />
        </AuthorSelectorContainer>
      </Popover>
    </div>
  );
};

const PostComposeBar = ({
  user = testUser,
  community,
  communities,
  edit,
  post = {},
  onSubmit,
  onSave,
  className,
}) => {
  const [author, setAuthor] = useState(user);
  const [text, setText] = useState(post.text || '');
  const [files, setFiles] = useState(post.files || []);
  const [images, setImages] = useState(post.images || []);

  const isEmpty = text.trim().length === 0 && files.length === 0 && images.length === 0;

  const isCommunityPost = isIdenticalAuthor(author, community);

  const setIsCommunityPost = shouldBeCommunityPost =>
    setAuthor(shouldBeCommunityPost ? community : user);

  const createPost = () => {
    if (isEmpty) return;
    onSubmit({
      id: Date.now(),
      author,
      text,
      files,
      images,
    });
    setText('');
    setFiles([]);
    setImages([]);
  };

  const updatePost = () => {
    if (isEmpty) return;
    onSave({
      ...post,
      text,
      files,
      images,
    });
  };

  const addImage = () => {
    const image = testImages[images.length % testImages.length];
    setImages([...images, { id: Date.now(), ...image }]);
  };

  const addFile = () => {
    const file = testFiles[files.length % testFiles.length];
    setFiles([...files, { id: Date.now(), ...file }]);
  };

  const onRemoveFile = file => {
    setFiles(files.filter(({ id }) => id !== file.id));
  };

  const onRemoveImage = image => {
    setImages(images.filter(({ id }) => id !== image.id));
  };

  const canUploadImage = files.length === 0 && images.length < MAX_IMAGES;
  const canUploadFile = images.length === 0 && files.length < MAX_FILES;

  return (
    <PostComposeContainer className={className} edit={edit}>
      {!edit && (
        <AuthorSelector
          author={author}
          user={user}
          communities={communities}
          onChange={setAuthor}
        />
      )}
      <PostContainer>
        <PostComposeTextareaWrapper edit={edit}>
          <PostComposeTextarea
            placeholder="What's going on..."
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
          />

          {!!files.length && <Files editing files={files} onRemove={onRemoveFile} />}
          {!!images.length && <Images editing images={images} onRemove={onRemoveImage} />}
        </PostComposeTextareaWrapper>
        <Footer edit={edit}>
          {!edit && !!community && (
            <PostAsCommunity value={isCommunityPost} onChange={setIsCommunityPost} />
          )}
          <FooterActionBar>
            <ImagePostIcon
              disabled={!canUploadImage}
              onClick={canUploadImage ? addImage : maxImagesWarning}
            />
            <FilePostIcon
              disabled={!canUploadFile}
              onClick={canUploadFile ? addFile : maxFilesWarning}
            />
            <PostButton disabled={isEmpty} onClick={edit ? updatePost : createPost}>
              {edit ? 'Save' : 'Post'}
            </PostButton>
          </FooterActionBar>
        </Footer>
      </PostContainer>
    </PostComposeContainer>
  );
};

export default customizableComponent('PostComposeBar')(PostComposeBar);

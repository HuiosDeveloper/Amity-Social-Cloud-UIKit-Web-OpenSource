import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Popover from '~/core/components/Popover';
import Menu, { MenuItem } from '~/core/components/Menu';

import { OptionsIcon, OptionsButton } from './styles';

const Options = ({ className, icon, options, position = 'bottom', align = 'end' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const attachCanceling = fn => () => {
    close();
    fn && fn();
  };

  const menu = (
    <Menu>
      {options.map(({ name, action }) => (
        <MenuItem key={name} onClick={attachCanceling(action)}>
          <FormattedMessage id={name} />
        </MenuItem>
      ))}
    </Menu>
  );

  return (
    <Popover
      isOpen={isOpen}
      onClickOutside={close}
      position={position}
      align={align}
      content={menu}
    >
      <OptionsButton className={className} onClick={open}>
        {icon || <OptionsIcon />}
      </OptionsButton>
    </Popover>
  );
};

export default Options;

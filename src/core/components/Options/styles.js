import styled from 'styled-components';

import { FontAwesomeIcon as FaIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH } from '@fortawesome/pro-regular-svg-icons';
import { SecondaryButton } from '~/core/components/Button';

export const OptionsIcon = styled(FaIcon).attrs({ icon: faEllipsisH })`
  font-size: 16px;
  cursor: pointer;
  margin-left: auto;
`;

export const OptionsButton = styled(SecondaryButton)`
  padding: 5px;
  height: 2rem;
  color: ${({ theme }) => theme.palette.neutral.main};
`;

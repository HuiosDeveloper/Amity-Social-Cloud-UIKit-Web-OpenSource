import React from 'react';
import { useIntl } from 'react-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SecondaryButton } from '~/core/components/Button';
import { confirm } from '~/core/components/Confirm';
import useSDK from '~/core/hooks/useSDK';
import { BottomSheet } from '~/v4/core/components';
import {
  MobileSheet,
  MobileSheetContainer,
  MobileSheetContent,
  MobileSheetHeader,
} from '~/v4/core/components/BottomSheet/styles';
import { useCustomization } from '~/v4/core/providers/CustomizationProvider';
import { Trash2Icon } from '~/icons';
import styles from './HyperLinkConfig.module.css';

interface HyperLinkConfigProps {
  pageId: '*';
  isHaveHyperLink: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onRemove: () => void;
}

const MAX_LENGTH = 30;

export const HyperLinkConfig = ({
  pageId = '*',
  isOpen,
  isHaveHyperLink,
  onClose,
  onSubmit,
  onRemove,
}: HyperLinkConfigProps) => {
  const componentId = 'hyper_link_config_component';
  const { getConfig } = useCustomization();
  const componentConfig = getConfig(`${pageId}/${componentId}/*`);
  const componentTheme = componentConfig?.theme.light || {};

  const cancelButtonConfig = getConfig(`*/hyper_link_config_component/cancel_button`);
  const doneButtonConfig = getConfig(`*/hyper_link_config_component/done_button`);

  const { formatMessage } = useIntl();
  const { client } = useSDK();

  const schema = z.object({
    url: z.string().refine(async (value) => {
      if (!value) return true;
      const hasWhitelistedUrls = await client?.validateUrls([value]).catch(() => false);
      return hasWhitelistedUrls;
    }, formatMessage({ id: 'storyCreation.hyperlink.validation.error.whitelisted' })),
    customText: z
      .string()
      .optional()
      .refine(async (value) => {
        if (!value) return true;
        const hasBlockedWord = await client?.validateTexts([value]).catch(() => false);
        return hasBlockedWord;
      }, formatMessage({ id: 'storyCreation.hyperlink.validation.error.blocked' })),
  });

  type HyperLinkFormInputs = z.infer<typeof schema>;

  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HyperLinkFormInputs>({
    resolver: zodResolver(schema),
  });

  const onSubmitForm = async (data: HyperLinkFormInputs) => {
    onSubmit(data);
    onClose();
  };

  const confirmDiscardHyperlink = () => {
    onRemove();
    onClose();
  };

  const discardHyperlink = () => {
    confirm({
      title: formatMessage({ id: 'storyCreation.hyperlink.removeConfirm.title' }),
      content: formatMessage({ id: 'storyCreation.hyperlink.removeConfirm.content' }),
      cancelText: formatMessage({ id: 'storyCreation.hyperlink.removeConfirm.cancel' }),
      okText: formatMessage({ id: 'storyCreation.hyperlink.removeConfirm.confirm' }),
      onOk: confirmDiscardHyperlink,
    });
  };

  return (
    <BottomSheet
      detent="full-height"
      mountPoint={document.getElementById('asc-uikit-create-story') as HTMLElement}
      rootId="asc-uikit-create-story"
      isOpen={isOpen}
      onClose={onClose}
    >
      <MobileSheetContainer>
        <MobileSheet.Header
          style={{
            backgroundColor: componentTheme?.primary_color,
            color: componentTheme?.secondary_color,
            borderTopLeftRadius: '0.5rem',
            borderTopRightRadius: '0.5rem',
          }}
        />
        <MobileSheetHeader
          style={{
            backgroundColor: componentTheme?.primary_color,
            color: componentTheme?.secondary_color,
          }}
        >
          <div className={styles.headerContainer}>
            <SecondaryButton onClick={onClose}>
              {cancelButtonConfig?.cancel_button_text ||
                formatMessage({ id: 'storyCreation.hyperlink.bottomSheet.cancel' })}
              {cancelButtonConfig?.cancel_icon && (
                <img src={cancelButtonConfig?.cancel_icon} width={16} height={16} />
              )}
            </SecondaryButton>
            <div className={styles.headerTitle}>
              {formatMessage({ id: 'storyCreation.hyperlink.bottomSheet.title' })}
            </div>
            <SecondaryButton
              style={{
                backgroundColor:
                  doneButtonConfig?.background_color || componentTheme?.primary_color,
                color: componentTheme?.secondary_color,
              }}
              form="asc-story-hyperlink-form"
              type="submit"
              className={styles.styledSecondaryButton}
            >
              {doneButtonConfig?.done_button_text ||
                formatMessage({ id: 'storyCreation.hyperlink.bottomSheet.submit' })}
              {doneButtonConfig?.done_icon && (
                <img src={doneButtonConfig.done_icon} width={16} height={16} />
              )}
            </SecondaryButton>
          </div>
        </MobileSheetHeader>
        <MobileSheetContent
          style={{
            backgroundColor: componentTheme?.primary_color,
            color: componentTheme?.secondary_color,
          }}
        >
          <div className={styles.hyperlinkFormContainer}>
            <form
              id="asc-story-hyperlink-form"
              onSubmit={handleSubmit(onSubmitForm)}
              className={styles.form}
            >
              <div className={styles.inputContainer}>
                <label
                  htmlFor="asc-uikit-hyperlink-input-url"
                  className={`${styles.label} ${styles.required}`}
                >
                  {formatMessage({ id: 'storyCreation.hyperlink.form.urlLabel' })}
                </label>
                <input
                  id="asc-uikit-hyperlink-input-url"
                  placeholder={formatMessage({ id: 'storyCreation.hyperlink.form.urlPlaceholder' })}
                  className={`${styles.input} ${errors?.url ? styles.hasError : ''}`}
                  {...register('url')}
                />
                {errors?.url && <span className={styles.errorText}>{errors?.url?.message}</span>}
              </div>
              <div className={styles.inputContainer}>
                <div className={styles.labelContainer}>
                  <label htmlFor="asc-uikit-hyperlink-input-link-text" className={styles.label}>
                    {formatMessage({ id: 'storyCreation.hyperlink.form.linkTextLabel' })}
                  </label>
                  <div className={styles.characterCount}>
                    {watch('customText')?.length} / {MAX_LENGTH}
                  </div>
                </div>
                <input
                  id="asc-uikit-hyperlink-input-link-text"
                  placeholder={formatMessage({
                    id: 'storyCreation.hyperlink.form.linkTextPlaceholder',
                  })}
                  className={`${styles.input} ${errors?.customText ? styles.hasError : ''}`}
                  {...register('customText')}
                />
                {errors?.customText && (
                  <span className={styles.errorText}>{errors?.customText?.message}</span>
                )}
                <label className={styles.description}>
                  {formatMessage({ id: 'storyCreation.hyperlink.form.linkTextDescription' })}
                </label>
              </div>
              {isHaveHyperLink && (
                <div className={styles.inputContainer}>
                  <SecondaryButton onClick={discardHyperlink} className={styles.removeLinkButton}>
                    <Trash2Icon className={styles.removeIcon} />
                    {formatMessage({ id: 'storyCreation.hyperlink.form.removeButton' })}
                  </SecondaryButton>
                  <div className={styles.divider} />
                </div>
              )}
            </form>
          </div>
        </MobileSheetContent>
      </MobileSheetContainer>
    </BottomSheet>
  );
};

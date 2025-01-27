import { useRef, useContext, useEffect } from 'react';

import FormHeader, { FormHeaderProps } from './FormHeader';
import FormFooter, { FormFooterProps } from './FormFooter';
import FormProgress from './FormProgress';
import FormSection, { FormSectionProps } from './FormSection';
import LoadingIndicator from '../../LoadingIndicator';
import { SectionTraversalContext } from '../SectionTraversalContext';
import { FormBodyImperativeHandle } from './FormBody';
import { CommonFormFieldsFragment } from '../../Models/commonFormFragments.generated';

export type FormPresenterProps = {
  convention: FormSectionProps['convention'];
  response: FormSectionProps['response'];
  form: CommonFormFieldsFragment;
  responseErrors: FormSectionProps['errors'];
  responseValuesChanged: FormSectionProps['responseValuesChanged'];
  isSubmittingResponse: FormFooterProps['isSubmittingResponse'];
  isUpdatingResponse: FormHeaderProps['isUpdatingResponse'];
  exitButton: FormFooterProps['exitButton'];
  submitButton: FormFooterProps['submitButton'];
  submitForm: FormFooterProps['submitForm'];
  footerContent: FormFooterProps['children'];
};

function FormPresenter({
  convention,
  form,
  response,
  responseErrors,
  responseValuesChanged,
  isSubmittingResponse,
  isUpdatingResponse,
  exitButton,
  submitButton,
  submitForm,
  footerContent,
}: FormPresenterProps) {
  const { currentSection } = useContext(SectionTraversalContext);

  const headerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<FormBodyImperativeHandle>(null);

  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentSection?.id]);

  if (!form || !convention || !response || !currentSection) {
    return (
      <div>
        <LoadingIndicator size={4} />
      </div>
    );
  }

  return (
    <div className="card mb-4">
      <FormHeader
        isUpdatingResponse={isUpdatingResponse}
        isSubmittingResponse={isSubmittingResponse}
        ref={headerRef}
      />

      <FormProgress form={form} />

      <div className="card-body pb-0">
        <FormSection
          ref={sectionRef}
          section={currentSection}
          convention={convention}
          response={response}
          errors={responseErrors}
          responseValuesChanged={responseValuesChanged}
        />
      </div>

      <FormFooter
        response={response}
        exitButton={exitButton}
        submitButton={submitButton}
        submitForm={submitForm}
        isSubmittingResponse={isSubmittingResponse}
        scrollToItem={sectionRef.current ? sectionRef.current.scrollToItem : () => {}}
      >
        {footerContent}
      </FormFooter>
    </div>
  );
}

export default FormPresenter;

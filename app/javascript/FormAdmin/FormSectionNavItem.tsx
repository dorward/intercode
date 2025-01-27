import { useContext } from 'react';
import { NavLink, useHistory, useRouteMatch } from 'react-router-dom';
import classNames from 'classnames';

import { DeleteFormSection } from './mutations';
import ErrorDisplay from '../ErrorDisplay';
import { FormEditorContext, FormEditorForm } from './FormEditorContexts';
import { FormEditorQuery } from './queries';
import { useDeleteMutation } from '../MutationUtils';
import { useConfirm } from '../ModalDialogs/Confirm';
import useSortable from '../useSortable';

export type FormSectionNavItemProps = {
  formSection: FormEditorForm['form_sections'][0];
  index: number;
  moveSection: (dragIndex: number, hoverIndex: number) => void;
};

function FormSectionNavItem({ formSection, index, moveSection }: FormSectionNavItemProps) {
  const { form, currentSection } = useContext(FormEditorContext);
  const confirm = useConfirm();
  const history = useHistory();
  const match = useRouteMatch<{ id: string }>();
  const deleteFormSection = useDeleteMutation(DeleteFormSection, {
    query: FormEditorQuery,
    queryVariables: { id: form.id },
    arrayPath: ['form', 'form_sections'],
    idVariablePath: ['id'],
  });

  const deleteConfirmed = async () => {
    await deleteFormSection({ variables: { id: formSection.id } });
    if (currentSection && formSection.id === currentSection.id) {
      history.replace(`/admin_forms/${form.id}/edit`);
    }
  };

  const [ref, drag, { isDragging }] = useSortable<HTMLLIElement>(index, moveSection, 'formSection');

  return (
    <li
      key={formSection.id}
      className={classNames('nav-item', { 'opacity-50': isDragging })}
      ref={ref}
    >
      <div className="d-flex align-items-center">
        <div className="mr-2">
          <span className="sr-only">Drag to reorder</span>
          <i
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            className="fa fa-bars"
            ref={drag}
          />
        </div>
        <NavLink
          to={`/admin_forms/${match.params.id}/edit/section/${formSection.id}`}
          className="nav-link flex-grow-1"
          replace
        >
          {formSection.title}
        </NavLink>
        <div className="ml-2">
          <button
            className="btn btn-outline-danger btn-sm"
            type="button"
            onClick={() =>
              confirm({
                prompt: 'Are you sure you want to delete this section and all items in it?',
                action: deleteConfirmed,
                renderError: (error) => <ErrorDisplay graphQLError={error} />,
              })
            }
          >
            <span className="sr-only">Delete item</span>
            <i className="fa fa-trash-o" />
          </button>
        </div>
      </div>
    </li>
  );
}

export default FormSectionNavItem;

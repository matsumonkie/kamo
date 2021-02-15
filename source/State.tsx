type Model =
  | Edit
  | New
  | Show

interface Show {
  type: "show"
}

interface Edit {
  type: "edit"
  id: number
  published: boolean
}

interface New {
  type: "new"
}

const isEditState = (state: Model): state is Edit => state.type === 'edit';


export { Model, Show, Edit, New, isEditState }
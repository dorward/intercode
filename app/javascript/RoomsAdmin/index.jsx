import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';
import { pluralize } from 'inflected';
import { ConfirmModal } from 'react-bootstrap4-modal';

import { CreateRoom, DeleteRoom, UpdateRoom } from './mutations.gql';
import ErrorDisplay from '../ErrorDisplay';
import GraphQLQueryResultWrapper from '../GraphQLQueryResultWrapper';
import GraphQLResultPropType from '../GraphQLResultPropType';
import InPlaceEditor from '../BuiltInFormControls/InPlaceEditor';
import { RoomsAdminQuery } from './queries.gql';

@flowRight([
  graphql(RoomsAdminQuery),
  graphql(CreateRoom, { name: 'createRoom' }),
  graphql(UpdateRoom, { name: 'updateRoom' }),
  graphql(DeleteRoom, { name: 'deleteRoom' }),
])
@GraphQLQueryResultWrapper
class RoomsAdmin extends React.Component {
  static propTypes = {
    data: GraphQLResultPropType(RoomsAdminQuery).isRequired,
    createRoom: PropTypes.func.isRequired,
    updateRoom: PropTypes.func.isRequired,
    deleteRoom: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      confirmingDeleteRoomId: null,
      creatingRoomName: '',
      error: null,
    };
  }

  roomNameDidChange = (id, name) => {
    this.props.updateRoom({ variables: { input: { id, room: { name } } } })
      .catch((error) => { this.setState({ error }); });
  }

  creatingRoomNameDidChange = (event) => {
    this.setState({ creatingRoomName: event.target.value });
  }

  keyDownInCreatingRoom = (event) => {
    if (event.key === 'Enter') {
      this.createRoomWasClicked(event);
    }
  }

  createRoomWasClicked = (event) => {
    event.preventDefault();
    this.props.createRoom({
      variables: { input: { room: { name: this.state.creatingRoomName } } },
      update: (store, { data: { createRoom: { room: newRoom } } }) => {
        const roomsData = store.readQuery({ query: RoomsAdminQuery });
        roomsData.convention.rooms.push(newRoom);
        store.writeQuery({ query: RoomsAdminQuery, data: roomsData });
      },
    }).then(() => { this.setState({ creatingRoomName: '' }); })
      .catch((error) => { this.setState({ error }); });
  }

  startDeletingRoom = (roomId) => {
    this.setState({ confirmingDeleteRoomId: roomId });
  }

  deleteRoomConfirmed = () => {
    const roomId = this.state.confirmingDeleteRoomId;
    this.props.deleteRoom({
      variables: { input: { id: roomId } },
      update: (store) => {
        const roomsData = store.readQuery({ query: RoomsAdminQuery });
        const roomIndex = roomsData.convention.rooms.findIndex(room => room.id === roomId);
        roomsData.convention.rooms.splice(roomIndex, 1);
        store.writeQuery({ query: RoomsAdminQuery, data: roomsData });
      },
    }).then(() => { this.setState({ confirmingDeleteRoomId: null }); })
      .catch((error) => { this.setState({ error }); });
  }

  deleteRoomCanceled = () => {
    this.setState({ confirmingDeleteRoomId: null });
  }

  render = () => {
    const sortedRooms = [...this.props.data.convention.rooms]
      .sort((a, b) => a.name.localeCompare(b.name));
    const roomRows = sortedRooms.map(room => (
      <li className="list-group-item" key={room.id}>
        <div className="row align-items-baseline">
          <div className="ml-3">
            <InPlaceEditor
              value={room.name}
              onChange={(newName) => { this.roomNameDidChange(room.id, newName); }}
            />
          </div>
          <div className="col">
            { room.runs.length > 0 ? (
              <span className="text-muted">
                (
                {room.runs.length}
                {' '}
                {pluralize('event run', room.runs.length)}
)
              </span>
            ) : null }
          </div>
          <button
            className="btn btn-sm btn-outline-danger mr-3"
            title="Delete room"
            onClick={() => { this.startDeletingRoom(room.id); }}
            type="button"
          >
            <i className="fa fa-trash" />
          </button>
        </div>
      </li>
    ));

    return (
      <div className="mb-4">
        <ul className="list-group mb-4">
          {roomRows}
          <li className="list-group-item">
            <div className="row align-items-baseline">
              <div className="col">
                <input
                  type="text"
                  placeholder="Room name"
                  className="form-control"
                  value={this.state.creatingRoomName}
                  onChange={this.creatingRoomNameDidChange}
                  onKeyDown={this.keyDownInCreatingRoom}
                />
              </div>
              <button
                className="btn btn-primary mr-2"
                disabled={this.state.creatingRoomName === ''}
                onClick={this.createRoomWasClicked}
                type="button"
              >
                Add room
              </button>
            </div>
          </li>
        </ul>

        <ErrorDisplay graphQLError={this.state.error} />
        <ConfirmModal
          visible={this.state.confirmingDeleteRoomId != null}
          onOK={this.deleteRoomConfirmed}
          onCancel={this.deleteRoomCanceled}
        >
          Are you sure you want to delete this room?
          <ErrorDisplay graphQLError={this.state.error} />
        </ConfirmModal>
      </div>
    );
  }
}

export default RoomsAdmin;

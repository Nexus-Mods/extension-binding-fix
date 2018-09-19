import * as actions from './actions';

import { util, types } from 'vortex-api';

const modsReducer: types.IReducerSpec = {
  reducers: {
    [actions.setModArchive as any]: (state, payload) => {
      const { gameId, modId, archiveId } = payload;
      return util.setSafe(state, [gameId, modId, 'archiveId'], archiveId);
    },
  },
  defaults: {
  },
};

export default modsReducer;

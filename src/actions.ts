import { createAction } from 'redux-act';

export const setModArchive = createAction('SET_MOD_ARCHIVE',
    (gameId: string, modId: string, archiveId: string) => ({ gameId, modId, archiveId }));

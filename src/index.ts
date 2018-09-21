import { setModArchive } from './actions';
import modsReducer from './reducer';
import { actions, selectors, types, util } from 'vortex-api'; 

function fix(api: types.IExtensionApi, assignments: Array<{ modId: string, archiveId: string }>) {
  const gameMode = selectors.activeGameId(api.store.getState());
  assignments.forEach(assign => {
    api.store.dispatch(setModArchive(gameMode, assign.modId, assign.archiveId));
    api.store.dispatch(actions.setDownloadInstalled(assign.archiveId, gameMode, assign.modId));
  });
}

function main(context: types.IExtensionContext) {
  const t = (key: string | string[], options?: any) =>
    context.api.translate(key, { ns: 'archive-binding-fix', ...(options || {}) });

  context.registerReducer(['persistent', 'mods'], modsReducer);

  context.registerAction('mod-icons', 100, 'recover', {}, 'Fix Bindings', () => {
    const state: types.IState = context.api.store.getState();
    const gameMode = selectors.activeGameId(state);
    const knownDownloads: { [dlId: string]: types.IDownload } =
      util.getSafe(state, ['persistent', 'downloads', 'files'], {});
    const knownDownloadSet = new Set(Object.keys(knownDownloads));
    const mods: { [modId: string]: types.IMod } = util.getSafe(state, ['persistent', 'mods', gameMode], {});

    // to be considered a mod has to have an invalid archiveId (including undefined) and have a fileNam
    const unBoundMods = Object.keys(mods).filter(modId =>
      !knownDownloadSet.has(mods[modId].archiveId)
      && (mods[modId].attributes !== undefined)
      && (mods[modId].attributes['fileName'] !== undefined));
    const reassign = unBoundMods.map(modId => {
      const archiveId = Object.keys(knownDownloads)
        .find(dlId => knownDownloads[dlId].localPath === mods[modId].attributes.fileName);
      return { modId, archiveId };
    })
    .filter(assignment => assignment.archiveId !== undefined);
    if (reassign.length === 0) {
      if (unBoundMods.length === 0) {
        context.api.showDialog('info', t('Fix Bindings'), {
          text: t('There were no mods with broken bindings that could be fixed.'),
          options: { translated: true },
        }, [ { label: 'Close' } ]);
      } else {
        context.api.showDialog('info', t('Fix Bindings'), {
          text: t('There were {{count}} mods with broken bindings but no matching archive '
                  + 'was found for any of them.', { replace: { count: unBoundMods.length } }),
          options: { translated: true },
        }, [ { label: 'Close' } ]);
      }
    } else {
      context.api.showDialog('question', 'Fix Bindings', {
        text: t('The following mods can be bound to the corresponding archive:'),
        checkboxes: reassign.map(assign => ({
            id: assign.modId,
            text: `${util.renderModName(mods[assign.modId])} -> ${knownDownloads[assign.archiveId].localPath}`,
            value: true })),
        options: { translated: true },
      }, [
        { label: 'Cancel' },
        { label: 'Fix' }
      ])
      .then(result => {
        if (result.action === 'Fix') {
          fix(context.api, reassign.filter(assign => result.input[assign.modId] === true));
        }
      });
    }
  });

  return true;
}

export default main;

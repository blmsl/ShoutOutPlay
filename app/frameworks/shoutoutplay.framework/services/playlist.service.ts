// angular
import {Injectable} from 'angular2/core';

// nativescript
import * as dialogs from 'ui/dialogs';

// libs
import {Store, Reducer, Action} from '@ngrx/store';
import {Observable} from 'rxjs/Rx';
import {TNSTrack, Utils} from 'nativescript-spotify';

// app
import {Analytics, AnalyticsService} from '../../analytics.framework/index';
import {LogService} from '../../core.framework/index';
import {PlaylistModel, TrackModel, PLAYER_ACTIONS} from '../index';

// analytics
const CATEGORY: string = 'Playlist';

/**
 * ngrx setup start --
 */
export interface PlaylistStateI {
  list: Array<PlaylistModel>;
  playing?: boolean;
}

const initialState: PlaylistStateI = {
  list: []
};

interface PLAYLIST_ACTIONSI {
  CREATE: string;
  CREATED: string;
  UPDATE: string;
}

export const PLAYLIST_ACTIONS: PLAYLIST_ACTIONSI = {
  CREATE: `[${CATEGORY}] CREATE`,
  CREATED: `[${CATEGORY}] CREATED`,
  UPDATE: `[${CATEGORY}] UPDATE`
};

export const playlistReducer: Reducer<PlaylistStateI> = (state: PlaylistStateI = initialState, action: Action) => {
  let changeState = () => {
    return Object.assign({}, state, action.payload);
  };
  switch (action.type) {
    case PLAYLIST_ACTIONS.CREATED:
      action.payload = { list: [...state.list, action.payload] };
      return changeState();
    case PLAYLIST_ACTIONS.UPDATE:
      action.payload = { list: action.payload };
      return changeState();
    default:
      return state;
  }
};
/**
 * ngrx end --
 */

@Injectable()
export class PlaylistService extends Analytics {
  public state$: Observable<any>;

  constructor(public analytics: AnalyticsService, private store: Store<any>, private logger: LogService) {
    super(analytics);
    this.category = CATEGORY;

    this.state$ = store.select('playlist');

    store.select(state => state.couchbase.playlists).subscribe((playlists) => {
      this.store.dispatch({ type: PLAYLIST_ACTIONS.UPDATE, payload: playlists });
    });
  }

  public togglePlay(playlistId: string) {
    let playlist: PlaylistModel;
    for (let p of this.getRawPlaylists()) {
      if (p.id === playlistId) {
        playlist = p;
        break;
      }
    }
    if (playlist.tracks.length) {
      this.store.dispatch({ type: PLAYER_ACTIONS.TOGGLE_PLAY, payload: { currentTrackId: playlist.tracks[0]} }); 
    } else {
      Utils.alert('This playist contains 0 tracks to play.');
    }
  }

  public addPrompt(track: TNSTrack) {
    let rawPlaylists = this.getRawPlaylists();

    let promptNew = () => {
      dialogs.prompt({
        title: 'Create a Playlist',
        okButtonText: 'Save',
        cancelButtonText: 'Cancel',
        inputType: dialogs.inputType.text
      }).then((r: any) => {
        this.create(r.text, track);
      });
    };
    
    if (rawPlaylists.length === 0) {
      // create playlist
      promptNew();
    } else {
      let existingLabel = 'Existing Playlist';
      let newLabel = 'New Playlist';
      dialogs.action({
        message: 'Add track to...',
        cancelButtonText: 'Cancel',
        actions: [existingLabel, newLabel]
      }).then((r: any) => {
        this.logger.debug(`User chose: ${r}`);
        switch (r) {
          case existingLabel:
            this.logger.debug('open existing playlist picker modal');
            break;
          case newLabel:
            promptNew();
            break;
        }
      });  
    }
  } 

  private create(name: string, track: TNSTrack) {
    this.logger.debug(`TODO: create playlist named '${name}', and add track: ${track.name}`);
    let newPlaylist = new PlaylistModel({ name });
    newPlaylist.addTrack(new TrackModel(track));
    this.store.dispatch({ type: PLAYLIST_ACTIONS.CREATE, payload: newPlaylist });
  }

  private addTrackTo(playlistId: string) {
    
  }

  private getRawPlaylists(): Array<PlaylistModel> {
    return this.store.getState().playlist.list;
  }
}
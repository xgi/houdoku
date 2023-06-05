import log from 'electron-log';
import fetch from 'node-fetch';
import {
  GetUsernameFunc,
  GetAuthUrlFunc,
  TrackerClientAbstract,
  SearchFunc,
  GetLibraryEntryFunc,
  AddLibraryEntryFunc,
  UpdateLibraryEntryFunc,
  GetTokenFunc,
} from '../../models/interface';
import {
  TrackEntry,
  TrackerMetadata,
  TrackerSeries,
  TrackScoreFormat,
  TrackStatus,
} from '../../models/types';

const BASE_URL = 'https://api.mangaupdates.com/v1';

const STATUS_MAP_NAME: { [key: string]: TrackStatus } = {
  read: TrackStatus.Reading,
  wish: TrackStatus.Planning,
  complete: TrackStatus.Completed,
  unfinished: TrackStatus.Dropped,
  hold: TrackStatus.Paused,
};

export const MU_DEFAULT_LIST_MAP: MUListEntry[] = [
  {
    id: "0",
    name: "Reading List",
    status: TrackStatus.Reading
  },
  {
    id: "1",
    name: "Wish List",
    status: TrackStatus.Planning
  },
  {
    id: "2",
    name: "Complete List",
    status: TrackStatus.Completed
  },
  {
    id: "3",
    name: "Unfinished List",
    status: TrackStatus.Dropped
  },
  {
    id: "4",
    name: "On Hold List",
    status: TrackStatus.Paused
  },
];

const STATUS_REVERSE_MAP: Record<TrackStatus, number> = {
  [TrackStatus.Reading]: 0,
  [TrackStatus.Planning]: 1,
  [TrackStatus.Completed]: 2,
  [TrackStatus.Dropped]: 3,
  [TrackStatus.Paused]: 4,
};

type TokenResponseData = {
  status: string;
  reason: string;
  context?: { session_token: string, uid: number };
};

type UserResponseData = {
  user_id: number;
  username: string;
};

type MangaResponseData = {
  series: {
    id: number;
    title: string;
  };
  list_id: number;
  status: {
    volume: number;
    chapter: number;
  };
  priority: number;
  time_added: {
    timestamp: number;
    as_rfc3339: string;
    as_string: string;
  };
};

type MangaListResponseData = {
  total_hits: number;
  page: number;
  per_page: number;
  results: {
    record: {
      series_id: number;
      title: string;
      url: string;
      description: string;
      image: {
        url: {
          original: string;
          thumb: string;
        };
        height: number;
        width: number;
      };
      type: string;
      year: string;
      bayesian_rating: number;
      rating_votes: number;
      genres: {
        genre: string;
      }[];
      last_updated: {
        timestamp: number;
        as_rfc3339: string;
        as_string: string;
      };
    };
    hit_title: string;
    metadata: {
      user_list: {
        list_id: number;
        list_type: string;
        list_icon: string;
        status: {
          volume: number;
          chapter: number;
        };
        priority: number;
        time_added: {
          timestamp: number;
          as_rfc3339: string;
          as_string: string;
        };
      };
      user_genre_highlights: {
        genre: string;
        color: string;
      }[];
    };
  }[];
};

type ListMetadataResponseData = {
  list_id: number;
  title: string;
  description: string;
  type: string;
  icon: string;
  custom: true;
  options: {
    public: boolean;
    sort: string;
    show_rating: boolean;
    show_status: boolean;
    show_comment: string;
    show_per_page: number;
    show_latest_chapter: boolean;
  };
};

type MangaRatingResponseData = {
  rating: number;
  last_updated: {
    timestamp: number;
    as_rfc3339: string;
    as_string: string;
  };
};

type SeriesMetadataResponseData = {
  series_id: number;
  title: string;
  url: string;
  associated: {
    title: string;
  }[];
  description: string;
  image: {
    url: {
      original: string;
      thumb: string;
    };
    height: number;
    width: number;
  };
  type: string;
  year: string;
  bayesian_rating: number;
  rating_votes: number;
  genres: {
    genre: string;
  }[];
  latest_chapter: number;
  status: string;
  licensed: boolean;
  completed: boolean;
  anime: {
    start: string;
    end: string;
  };
  authors: {
    name: string;
    author_id: number;
    type: string;
  }[];
};


type AddLibraryResponseData = {
  status: string;
  reason: string;
  context?: {
    errors: [
      {
        series_id: number,
        error: string,
      }
    ]
  }
};

type UpdateMangaResponseData = {
  status: string;
  reason: string;
  context?: {
    updates: [
      {
        series_id: number;
        volume: number;
        chapter: number;
      }
    ] | [];
    errors?: [
      {
        series_id: number,
        error: string,
      }
    ]
  }
};

type MUListEntry = {
  id: string;
  name: string;
  status: TrackStatus;
};

export const MUTrackerMetadata: TrackerMetadata = {
  id: 'MU',
  name: 'MangaUpdates',
  url: 'https://mangaupdates.com',
};

export class MUTrackerClient extends TrackerClientAbstract {

  getMetadata: () => TrackerMetadata = () => {
    return MUTrackerMetadata;
  };

  getAuthUrl: GetAuthUrlFunc = () => {
    return `${BASE_URL}/account/login`;
  };

  getToken: GetTokenFunc = (code: string) => {
    const url = `${BASE_URL}/account/login`;
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: code,
    };

    return fetch(url, options)
      .then((response) => response.json())
      .then((data: TokenResponseData) => {
        if (data.status === 'exception') {
          log.error(
            `Error getting token from tracker ${MUTrackerMetadata.id}: 
              ${data.reason}`
          );
          return null;
        }
        return data.context!.session_token;
      })
      .catch((e: Error) => {
        log.error(e);
        return null;
      });
  };

  getUsername: GetUsernameFunc = () => {
    if (this.accessToken === '') return new Promise((resolve) => resolve(null));

    const url = `${BASE_URL}/account/profile`;
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
      },
    };

    return fetch(url, options)
      .then((response) => {
        if (response.status === 401) {
          log.error(
            `Error getting username from tracker ${MUTrackerMetadata.id}: Unauthorized access`
          );
          return null;
        }
        return response.json();
      })
      .then((data: UserResponseData | null) => {
        return data ? `${data.user_id}` : null;
      })
      .catch((e: Error) => {
        log.error(e);
        return null;
      });
  };

  search: SearchFunc = async (text: string) => {
    if (this.accessToken === '') return new Promise((resolve) => resolve([]));

    const url = `${BASE_URL}/series/search`;
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ search: text }),
    };

    return fetch(url, options)
      .then((response) => response.json())
      .then((data: MangaListResponseData) => {
        return data.results.map((item) => {
          const { record } = item;
          return {
            id: record.series_id.toString(),
            title: record.title,
            description: record.description,
            coverUrl: record.image.url.original,
          } as TrackerSeries;
        });
      })
      .catch((e: Error) => {
        log.error(e);
        return [];
      });
  };

  getLibraryEntry: GetLibraryEntryFunc = async (seriesId: string) => {
    if (this.accessToken === '') return new Promise((resolve) => resolve(null));

    const url = `${BASE_URL}/lists/series/${seriesId}`;
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
      },
    };

    return fetch(url, options)
      .then((response) => {
        if (response.status === 404) {
          log.error(
            `Error getting library entry for series ${seriesId} from tracker ${MUTrackerMetadata.id}: Series not found`
          );
          return null;
        }
        else if (response.status === 401) {
          log.error(
            `Error getting library entry for series ${seriesId} from tracker ${MUTrackerMetadata.id}: Unauthorized access`
          );
          return null;
        }

        return response.json();
      })
      .then(async (data: MangaResponseData) => {
        if (data == null) {
          return null;
        }

        const listEntry: MUListEntry | null = (data.list_id >= 0 && data.list_id <= 4)
          ? MU_DEFAULT_LIST_MAP[data.list_id]
          : await this.GetListStatusEntryFunc(data.list_id);
        const rating: number | null = await this.GetLibraryRatingEntryFunc(data.series.id);

        const metadata: TrackEntry | null = await this.GetSeriesMetadataEntryFunc(data.series.id)

        if (listEntry === null || rating === null || metadata === null) {
          return null;
        }

        return {
          seriesId: `${data.series.id}`,
          title: data.series.title,
          url: metadata.url,
          description: metadata.description,
          coverUrl: metadata.coverUrl,
          score: rating,
          scoreFormat: TrackScoreFormat.POINT_10_DECIMAL_ONE_DIGIT,
          progress: data.status.chapter,
          status: listEntry.status,
          listId: `${listEntry.id}`,
          listName: listEntry.name
        } as TrackEntry;
      })
      .catch((e: Error) => {
        log.error(e);
        return null;
      });
  };

  GetListStatusEntryFunc = async (listId: number): Promise<MUListEntry | null> => {
    if (this.accessToken === '') return new Promise((resolve) => resolve(null));

    if (listId < 0 || (listId > 4 && listId < 101)) {
      log.error(
        `Error getting status for list ${listId} from tracker ${MUTrackerMetadata.id}: listid out of range`
      );
      return null;
    }

    const url = `${BASE_URL}/lists/${listId}`;
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
      },
    };

    return fetch(url, options)
      .then((response) => {
        if (response.status === 404) {
          log.error(
            `Error getting status for list ${listId} from tracker ${MUTrackerMetadata.id}: List not found`
          );
          return null;
        }
        else if (response.status === 401) {
          log.error(
            `Error getting status for list ${listId} from tracker ${MUTrackerMetadata.id}: Unauthorized access`
          );
          return null;
        }
        return response.json();
      })
      .then((data: ListMetadataResponseData | null) => {
        if (data === null) {
          return null;
        }

        return {
          id: `${data.list_id}`,
          name: data.title,
          status: STATUS_MAP_NAME[data.type]
        } as MUListEntry;
      })
      .catch((e: Error) => {
        log.error(e);
        return null;
      });
  };

  GetLibraryRatingEntryFunc = async (seriesId: number): Promise<number | null> => {
    if (this.accessToken === '') return new Promise((resolve) => resolve(null));

    const url = `${BASE_URL}/series/${seriesId}/rating`;
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
      },
    };

    return fetch(url, options)
      .then((response) => {
        if (response.status === 404) {
          log.error(
            `Error getting score for series ${seriesId} from tracker ${MUTrackerMetadata.id}: Series without a score`
          );
          return null;
        }
        else if (response.status === 401) {
          log.error(
            `Error getting score for series ${seriesId} from tracker ${MUTrackerMetadata.id}: Unauthorized access`
          );
          return null;
        }
        return response.json();
      })
      .then((data: MangaRatingResponseData | null) => {
        return data ? data.rating : null;
      })
      .catch((e: Error) => {
        log.error(e);
        return null;
      });
  };

  GetSeriesMetadataEntryFunc = async (seriesId: number): Promise<TrackEntry | null> => {
    const url = `${BASE_URL}/series/${seriesId}`;
    const options = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    };

    return fetch(url, options)
      .then((response) => {
        if (response.status === 404) {
          log.error(
            `Error getting metadata for series ${seriesId} from tracker ${MUTrackerMetadata.id}: Series not found`
          );
          return null;
        }
        return response.json();
      })
      .then((data: SeriesMetadataResponseData | null) => {
        return data ? {
          url: data.url,
          description: data.description,
          coverUrl: data.image.url.original,
        } as TrackEntry : null;
      })
      .catch((e: Error) => {
        log.error(e);
        return null;
      });
  };

  //function called only by updateLibraryEntry if the series is not in any list
  addLibraryEntry: AddLibraryEntryFunc = async (trackEntry: TrackEntry) => {
    if (this.accessToken === '') return new Promise((resolve) => resolve(null));

    const url = `${BASE_URL}/lists/series`;
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify([
        {
          series: {
            id: Number(trackEntry.seriesId)
          },
          list_id: trackEntry.status !== undefined ? STATUS_REVERSE_MAP[trackEntry.status] : 0,
          status: {
            chapter: trackEntry.progress
          }
        }
      ]),
    };
    return fetch(url, options)
      .then((response) => {
        if (response.status === 401) {
          log.error(
            `Error adding library entry for series ${trackEntry.seriesId} from tracker ${MUTrackerMetadata.id}: Unauthorized access`
          );
          return null;
        }
        return response.json();
      })
      .then((data: AddLibraryResponseData | null) => {
        if (data?.status === "exception") {
          log.error(
            `Error add library entry for [${data.context!.errors.map((error) =>
              `Series ID: ${error.series_id}, Error: ${error.error}`).join('; ')
            }] from tracker ${MUTrackerMetadata.id}`);
          return null;
        }

        return this.getLibraryEntry(trackEntry.seriesId);
      })
      .catch((e: Error) => {
        log.error(e);
        return null;
      });
  };

  updateLibraryEntry: UpdateLibraryEntryFunc = async (trackEntry: TrackEntry) => {
    if (this.accessToken === '') return new Promise((resolve) => resolve(null));

    const prevEntry = await this.getLibraryEntry(trackEntry.seriesId);
    if (prevEntry === null) {
      return this.addLibraryEntry(trackEntry)
    }
    else {
      let newEntry = null;
      if (prevEntry.progress !== trackEntry.progress ||
        prevEntry.listId !== trackEntry.listId) {
        newEntry = this.updateLibraryProgressEntry(trackEntry);
      }
      if (trackEntry.score !== prevEntry.score) {
        newEntry = this.updateLibraryRatingEntry(trackEntry);
      }
      return newEntry;
    }
  };

  updateLibraryProgressEntry: UpdateLibraryEntryFunc = async (trackEntry: TrackEntry) => {
    if (this.accessToken === '') return new Promise((resolve) => resolve(null));

    const url = `${BASE_URL}/lists/series/update`;
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify([
        {
          series: {
            id: Number(trackEntry.seriesId)
          },
          list_id: Number(trackEntry.listId),
          status: {
            chapter: trackEntry.progress
          }
        }
      ]),
    };

    return fetch(url, options)
      .then((response) => {
        if (response.status === 401) {
          log.error(
            `Error updating library entry for series ${trackEntry.seriesId} from tracker ${MUTrackerMetadata.id}: Unauthorized access`
          );
          return null;
        }
        return response.json();
      })
      .then((data: UpdateMangaResponseData | null) => {
        if (data?.status === "exception") {
          log.error(
            `Error updating library entry for [${data.context!.errors!.map((error) =>
              `Series ID: ${error.series_id}, Error: ${error.error}`).join('; ')
            }] from tracker ${MUTrackerMetadata.id}`);
          return null;
        }

        return this.getLibraryEntry(trackEntry.seriesId);
      })
      .catch((e: Error) => {
        log.error(e);
        return null;
      });
  };

  updateLibraryRatingEntry: UpdateLibraryEntryFunc = async (trackEntry: TrackEntry) => {
    if (this.accessToken === '') return new Promise((resolve) => resolve(null));

    const url = `${BASE_URL}/series/${trackEntry.seriesId}/rating`;
    const options = {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(
        {
          rating: trackEntry.score
        }
      ),
    };

    return fetch(url, options)
      .then((response) => {
        if (response.status === 401) {
          log.error(
            `Error updating library rating entry for series ${trackEntry.seriesId} from tracker ${MUTrackerMetadata.id}: Unauthorized access`
          );
          return null;
        }
        else if (response.status === 404) {
          log.error(
            `Error updating library rating entry for series ${trackEntry.seriesId} from tracker ${MUTrackerMetadata.id}: Series not found`
          );
          return null;
        }
        return this.getLibraryEntry(trackEntry.seriesId);
      })
      .catch((e: Error) => {
        log.error(e);
        return null;
      });
  };
}
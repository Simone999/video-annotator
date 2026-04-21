import { useEffect, type Dispatch, type SetStateAction, useState } from "react";

import { listIndexedVideos, type IndexedVideo } from "../api";
import type { VideoListStatus } from "../workspace-types";
import { formatWorkspaceError } from "./workspace-utils";

export function useIndexedVideos({
  setErrorMessage,
}: {
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
}) {
  const [indexedVideos, setIndexedVideos] = useState<readonly IndexedVideo[]>(
    [],
  );
  const [listStatus, setListStatus] = useState<VideoListStatus>("loading");

  useEffect(() => {
    let isCancelled = false;

    async function loadVideos() {
      try {
        const videos = await listIndexedVideos();

        if (isCancelled) {
          return;
        }

        setIndexedVideos(videos);
        setListStatus(videos.length === 0 ? "empty" : "ready");
      } catch (error: unknown) {
        if (isCancelled) {
          return;
        }

        setIndexedVideos([]);
        setErrorMessage(formatWorkspaceError(error));
        setListStatus("error");
      }
    }

    void loadVideos();

    return () => {
      isCancelled = true;
    };
  }, [setErrorMessage]);

  return {
    indexedVideos,
    listStatus,
  };
}

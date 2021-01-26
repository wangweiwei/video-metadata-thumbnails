import { IMetadata } from './imetadata';
import { IOption } from './ioption';
import { IThumbnail } from './ithumbnail';

/**
 * 无需上传即可获得视频元数据和视频帧的Blob图片
 *
 * @author wangweiwei
 */

export class Video {
  /**
   * Video Element
   */
  private videoElement: HTMLVideoElement;

  /**
   * Canvas Element
   */
  private canvas: HTMLCanvasElement;

  /**
   * Canvas Context
   */
  private canvasContext: CanvasRenderingContext2D;

  /**
   * 当前Video的帧图片
   */
  private thumbnails: IThumbnail[] = [];

  /**
   * 选项
   */
  private option: IOption = {
    quality: 0.7,
    interval: 1,
    scale: 0.7,
    start: 0
  };

  /**
   * 是否第一帧
   */
  private isStarted: boolean = true;

  /**
   * 帧图片数
   */
  private count: number = 0;

  /**
   * 版本
   */
  private version: string = '__VERSION__';

  /**
   * 实例化Video对象
   *  - 创建视频元素
   *  - 创建canvas元素并拿到canvas context
   *  - video元素赋值src，开始加载视频
   *  - 视频播放结束后的内存回收处理
   *
   * @param blob string | Blob
   *
   */
  constructor(blob: string | Blob) {
    if (!blob) {
      throw new Error('__NAME__ params error');
    }
    // 初始化视频元素
    this.videoElement = document.createElement('video') as HTMLVideoElement;
    this.videoElement.preload = 'metadata';
    this.videoElement.muted = true;
    this.videoElement.volume = 0;
    this.videoElement.crossOrigin = 'anonymous';

    // 初始化canvas
    const canvas: HTMLCanvasElement = document.createElement('canvas') as HTMLCanvasElement;
    this.canvas = canvas;
    this.canvasContext = canvas.getContext('2d') as CanvasRenderingContext2D;

    // 赋值src
    const URL = window.URL || window.webkitURL;
    this.videoElement.src =
      typeof blob === 'string' || blob instanceof String ? (blob as string) : URL.createObjectURL(blob);

    // 视频播放结束相关回收
    const endedHandler = () => {
      const _blob: string | Blob = this.videoElement.src as string | Blob;
      if (!(typeof _blob === 'string' || _blob instanceof String)) {
        URL.revokeObjectURL(this.videoElement.src);
      }
      this.videoElement.removeEventListener('ended', endedHandler, false);
    };
    this.videoElement.addEventListener('ended', endedHandler, false);
  }

  /**
   * 获取版本信息
   */
  getVersion() {
    return this.version;
  }

  /**
   * 获取帧图片
   *
   * @param option IOption 选项
   *
   * @return Promise<(Blob | null)[]> 帧图片Blob集合
   */
  getThumbnails(option?: IOption): Promise<IThumbnail[]> {
    // 选项赋值
    if (option) {
      this.option = Object.assign(this.option, option);
    }
    return new Promise((resolve, reject) => {
      const canplayHandler = () => {
        const interval = this.option.interval || 1;
        const { videoWidth, videoHeight, duration } = this.videoElement;
        if (!this.isStarted) {
          this.videoElement.currentTime += interval;
        } else {
          this.videoElement.currentTime = this.option.start;
          this.isStarted = false;
        }
      };
      const timeupdateHandler = () => {
        const { option, videoElement, canvasContext, thumbnails } = this;
        const { videoWidth, videoHeight, duration } = videoElement;
        const { quality, interval, start, end, scale } = option;
        const { currentTime } = videoElement;
        const isEnded = currentTime >= duration || currentTime > (end === undefined ? duration : end);
        const $interval = interval || 1;
        const $videoWidth = videoWidth * (scale || 1);
        const $videoHeight = videoHeight * (scale || 1);

        try {
          this.canvas.width = $videoWidth;
          this.canvas.height = $videoHeight;
          this.canvasContext.drawImage(this.videoElement, 0, 0, $videoWidth, $videoHeight);

          // blob 兼容性
          if (!this.canvas.toBlob) {
            const binStr = atob(this.canvas.toDataURL('image/jpeg', quality).split(',')[1]);
            const len = binStr.length;
            const arr = new Uint8Array(len);

            for (let i = 0; i < len; i++) {
              arr[i] = binStr.charCodeAt(i);
            }
            const blob: Blob = new Blob([arr], { type: 'image/jpeg' });

            canvasContext.clearRect(0, 0, $videoWidth, $videoHeight);
            canvasContext.restore();

            if (isEnded) {
              videoElement.removeEventListener('canplaythrough', canplayHandler, false);
              videoElement.removeEventListener('timeupdate', timeupdateHandler, false);
              resolve(this.thumbnails);
              return;
            }

            thumbnails.push({
              currentTime: start + $interval * this.count,
              blob
            });
            this.count++;
          } else {
            this.canvas.toBlob(
              blob => {
                canvasContext.clearRect(0, 0, $videoWidth, $videoHeight);
                canvasContext.restore();

                if (isEnded) {
                  videoElement.removeEventListener('canplaythrough', canplayHandler, false);
                  videoElement.removeEventListener('timeupdate', timeupdateHandler, false);
                  resolve(this.thumbnails);
                  return;
                }

                thumbnails.push({
                  currentTime: start + $interval * this.count,
                  blob
                });
                this.count++;
              },
              'image/jpeg',
              quality
            );
          }
        } catch (error) {
          reject(error);
        }
      };
      const progressHandler = () => {
        this.videoElement.play();
        this.videoElement.removeEventListener('progress', progressHandler, false);
      }

      // 判断如果是Safari
      if(/^((?!chrome).)*safari((?!chrome).)*$/i.test(navigator.userAgent)) {
        this.videoElement.addEventListener('progress', progressHandler, false);
      }

      const endedHandler = () => {
        this.videoElement.removeEventListener('progress', progressHandler, false);
        this.videoElement.removeEventListener('ended', endedHandler, false);
        this.videoElement.removeEventListener('canplaythrough', canplayHandler, false);
        this.videoElement.removeEventListener('timeupdate', timeupdateHandler, false);
        this.videoElement.removeEventListener('error', errorHandler, false);
      };
      const errorHandler = () => {
        const { error } = this.videoElement;
        if (error) {
          reject(new Error(`__NAME__ error ${error.code}; details: ${error.message}`));
        } else {
          reject(new Error('__NAME__ unknown error'));
        }
        this.videoElement.removeEventListener('progress', progressHandler, false);
        this.videoElement.removeEventListener('ended', endedHandler, false);
        this.videoElement.removeEventListener('canplaythrough', canplayHandler, false);
        this.videoElement.removeEventListener('timeupdate', timeupdateHandler, false);
        this.videoElement.removeEventListener('error', errorHandler, false);
      };
      this.videoElement.addEventListener('canplaythrough', canplayHandler, false);
      this.videoElement.addEventListener('timeupdate', timeupdateHandler, false);
      this.videoElement.addEventListener('ended', endedHandler, false);
      this.videoElement.addEventListener('error', errorHandler, false);
    });
  }

  drawThumbnails() {}

  /**
   * 获取Metadata信息
   *
   * @return Promise<IMetadata> video元数据信息
   */
  getMetadata(): Promise<IMetadata> {
    return new Promise((resolve, reject) => {
      const loadedmetadataHandler = () => {
        try {
          const { videoWidth, videoHeight, duration } = this.videoElement;
          //  fix a bug for chrome
          //  https://bugs.chromium.org/p/chromium/issues/detail?id=642012
          if (duration === Infinity) {
            const timeupdateHandler = () => {
              this.videoElement.removeEventListener('timeupdate', timeupdateHandler, false);
              this.videoElement.removeEventListener('loadedmetadata', loadedmetadataHandler, false);
              resolve({
                width: Math.floor(this.videoElement.videoWidth * 100) / 100,
                height: Math.floor(this.videoElement.videoHeight * 100) / 100,
                duration: Math.floor(this.videoElement.duration * 100) / 100
              });
              this.videoElement.currentTime = 0;
            };
            this.videoElement.addEventListener('timeupdate', timeupdateHandler, false);
            this.videoElement.currentTime = Number.MAX_SAFE_INTEGER;
          } else {
            resolve({
              width: Math.floor(videoWidth * 100) / 100,
              height: Math.floor(videoHeight * 100) / 100,
              duration: Math.floor(duration * 100) / 100
            });
            this.videoElement.removeEventListener('loadedmetadata', loadedmetadataHandler, false);
          }
        } catch (error) {
          reject(error);
        }
      };
      const endedHandler = () => {
        this.videoElement.removeEventListener('loadedmetadata', loadedmetadataHandler, false);
        this.videoElement.removeEventListener('ended', endedHandler, false);
        this.videoElement.removeEventListener('error', errorHandler, false);
      };
      const errorHandler = () => {
        const { error } = this.videoElement;
        if (error) {
          reject(new Error(`__NAME__ error ${error.code}; details: ${error.message}`));
        } else {
          reject(new Error('__NAME__ unknown error'));
        }
        this.videoElement.removeEventListener('loadedmetadata', loadedmetadataHandler, false);
        this.videoElement.removeEventListener('ended', endedHandler, false);
        this.videoElement.removeEventListener('error', errorHandler, false);
      };
      this.videoElement.addEventListener('loadedmetadata', loadedmetadataHandler, false);
      this.videoElement.addEventListener('ended', endedHandler, false);
      this.videoElement.addEventListener('error', errorHandler, false);
    });
  }
}

/**
 * 获取Metadata信息
 *
 * @param blob string | Blob
 *
 * @return Promise<IMetadata> video元数据信息
 */
export async function getMetadata(blob: string | Blob): Promise<IMetadata> {
  const video: Video = new Video(blob);
  const metadata = await video.getMetadata();
  return metadata;
}

/**
 * 获取帧频文件
 *
 * @param blob string | Blob
 *
 * @param option IOption 选项
 *
 * @return Promise<(Blob | null)[]> 帧图片Blob集合
 */
export async function getThumbnails(blob: string | Blob, option?: IOption): Promise<IThumbnail[]> {
  const video: Video = new Video(blob);
  const thumbnails = await video.getThumbnails(option);
  return thumbnails;
}

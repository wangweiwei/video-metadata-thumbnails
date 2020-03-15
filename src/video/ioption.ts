/**
 * 选项约束
 */
export interface IOption {
  /**
   * 图片质量
   */
  quality?: number;

  /**
   * 取图片的时间间隔
   */
  interval?: number;

  /**
   * 缩放比例
   */
  scale?: number;

  /**
   * 范围：开始帧
   */
  start: number;

  /**
   * 范围：结束帧
   */
  end?: number;

  // 是否生成雪碧图
  sprite?: boolean;
  // 是否提供base64格式图片，雪碧图和图片清晰度控制，toDataURL
  base64?: boolean;
}

// 识别commonjs类型的包，默认只支持导入ES6
import commonjs from '@rollup/plugin-commonjs';
// 支持import导入
import nodeResolve from '@rollup/plugin-node-resolve';
// TypeScript编译(TypeScript转JavaScript)
import typescript from 'rollup-plugin-typescript2';
// 支持加载Json文件
import json from '@rollup/plugin-json';
// 支持字符串替换, 比如动态读取package.json的version到代码
import replace from '@rollup/plugin-replace';
// 读取package.json
import pkg from './package.json';
// 压缩
import { terser } from "rollup-plugin-terser";
// 测试serve
import serve from 'rollup-plugin-serve';

const banner = `
  /*!
   * Video metadata and thumbnails v${pkg.version}
   *
   * @author wangweiwei
   */
`

export default {
  input: './src/index.ts',
  output: [{
    format: 'cjs',
    file: pkg.main,
    banner,
    file: './lib/video-metadata-thumbnails.cjs.js',
    sourcemap: true
  }, {
    format: 'es',
    file: pkg.module,
    banner,
    file: './lib/video-metadata-thumbnails.es.js',
    sourcemap: true,
  }, {
    format: 'umd',
    name: '__video_metadata_thumbnails__',
    file: pkg.browser,
    banner,
    file: './lib/video-metadata-thumbnails.umd.js',
    sourcemap: true
  }, {
    format: 'iife',
    name: '__video_metadata_thumbnails__',
    file: pkg.browser,
    banner,
    file: './lib/video-metadata-thumbnails.iife.js',
    sourcemap: true
  }],
  plugins: [
    json(),
    replace({
      __VERSION__: pkg.version,
      __NAME__: pkg.name
    }),
    typescript({
      exclude: 'node_modules/**',
      rollupCommonJSResolveHack: false,
      clean: true,
      typescript: require('typescript')
    }),
    nodeResolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    terser(),
    serve({
      host: 'localhost',
      port: 8000,
      contentBase: ['lib', 'examples'],
    })
  ],
  watch: {
    exclude: ['node_modules/**']
  }
}

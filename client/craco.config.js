module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "buffer": require.resolve("buffer"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "util": require.resolve("util"),
        "assert": require.resolve("assert"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify"),
        "url": require.resolve("url"),
        "fs": false,
        "net": false,
        "tls": false,
        "child_process": false,
        "_stream_readable": require.resolve("stream-browserify/lib/_stream_readable"),
        "_stream_writable": require.resolve("stream-browserify/lib/_stream_writable"),
        "_stream_duplex": require.resolve("stream-browserify/lib/_stream_duplex"),
        "_stream_transform": require.resolve("stream-browserify/lib/_stream_transform"),
      };
      return webpackConfig;
    },
  },
};
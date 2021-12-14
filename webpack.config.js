const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { merge } = require("webpack-merge");

const prodConfig = require("./webpack.prod");
const devConfig = require("./webpack.dev");

const resolveApp = (relativePath) => path.resolve(__dirname, relativePath);

const getPublicPath = () => {
  const homePage = require(resolveApp("package.json")).homepage;

  if (process.env.NODE_ENV === "development") {
    return "";
  } else if (process.env.PUBLIC_URL) {
    return process.env.PUBLIC_URL;
  } else if (homePage) {
    return homePage;
  }
  return "/";
};

const getEnvVariables = () => ({
  PUBLIC_URL: getPublicPath(),
  VERSION: require(resolveApp("package.json")).version,
});

module.exports = function () {
  const isEnvProduction = process.env.NODE_ENV === "production";

  const commonConfig = {
    entry: "./src/index.ts",
    output: {
      filename: "js/[name].bundle.js",
      path: path.resolve(__dirname, "dist"),
    },
    plugins: [
      new webpack.ProgressPlugin(),
      new CleanWebpackPlugin(),
      new CopyPlugin({
        patterns: [
          {
            from: "public",
            globOptions: {
              ignore: ["**/index.html"],
            },
          },

          { from: "./src/assets/images", to: "images" },
          { from: "./src/assets/fonts", to: "fonts" },
          { from: "./src/assets/vendor", to: "js" },
        ],
      }),
      new HtmlWebpackPlugin({
        inject: true,
        template: resolveApp("public/index.html"),
        ...getEnvVariables(),
      }),
      new MiniCssExtractPlugin({ filename: "[name].bundle.css" }),
    ],

    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          loader: "ts-loader",
          include: [resolveApp("src")],
          exclude: [/node_modules/],
        },
        {
          test: /.(scss|css)$/,

          use: [
            isEnvProduction ? MiniCssExtractPlugin.loader : "style-loader",
            {
              loader: "css-loader",

              options: {
                sourceMap: true,
              },
            },
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [["postcss-preset-env"]],
                },
              },
            },
            {
              loader: "sass-loader",

              options: {
                sourceMap: true,
                implementation: require("sass"),
              },
            },
          ],
        },
        {
          test: /\.(?:ico|gif|png|jpg|jpeg|svg)$/i,
          type: "javascript/auto",
          loader: "file-loader",
          options: {
            publicPath: "../",
            name: "[path][name].[ext]",
            context: path.resolve(__dirname, "src/assets"),
            emitFile: true,
          },
        },
        {
          test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
          type: "javascript/auto",
          exclude: /images/,
          loader: "file-loader",
          options: {
            publicPath: "../",
            context: path.resolve(__dirname, "src/assets"),
            name: "[path][name].[ext]",
            emitFile: true,
          },
        },
      ],
    },

    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
  };

  if (isEnvProduction) return merge(commonConfig, prodConfig);
  else return merge(commonConfig, devConfig);
};

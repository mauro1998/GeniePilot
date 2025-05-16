import { ThemeConfig, theme as antdTheme } from 'antd';

const { darkAlgorithm } = antdTheme;

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
  },
  algorithm: darkAlgorithm,
  components: {
    Layout: {
      bodyBg: '#141414',
      headerBg: '#1f1f1f',
      siderBg: '#1f1f1f',
    },
    Menu: {
      darkItemBg: '#1f1f1f',
    },
  },
};

export default theme;

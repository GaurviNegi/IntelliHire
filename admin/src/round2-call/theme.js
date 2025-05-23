// round2-call/theme.js
import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const styles = {
  global: {
    body: {
      bg: 'black',
      color: 'white',
    },
  },
};

const theme = extendTheme({ config, styles });

export default theme;
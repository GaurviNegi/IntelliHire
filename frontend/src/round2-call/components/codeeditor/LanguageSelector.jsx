/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import {
  Box,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import React from "react";
import { LANGUAGE_VERSIONS } from "../../constants";

const languages = Object.entries(LANGUAGE_VERSIONS);

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function LanguageSelector({ language, onSelect }) {
  return (
    <Box ml={2} mb={4}>
      <Text mb={2} fontSize="lg">
        Languages :
      </Text>
      <Menu isLazy>
        <MenuButton
          as={Button}
          px={4}
          py={2}
          transition="all 0.2s"
          borderRadius="md"
          borderWidth="1px"
          borderColor="green.400"
          color="green.300"
          _hover={{ bg: "gray.600" }}
          _expanded={{ bg: "gray.800" }}
          _focus={{ boxShadow: "outline", outlineColor: "green.800" }}
        >
          {toTitleCase(language)}
        </MenuButton>
        <MenuList bg="gray.800">
          {languages.map(([lang, version]) => (
            <MenuItem
              key={lang}
              onClick={() => onSelect(lang)}
              color={lang == language ? "green.400" : ""}
              bg={lang == language ? "gray.700" : "transparent"}
              _hover={{ color: "green.400", bg: "gray.900" }}
            >
              {toTitleCase(lang)} &nbsp;
              <Text as="span" color="gray.600" fontSize="sm">
                ({version})
              </Text>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
}

export default LanguageSelector;

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React from "react";
import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import HeaderWrapper from "@/components/layouts/header/HeaderWrapper";
// @ts-ignore
const Create = dynamic(() => import("editor/Create"), { ssr: false });

const create = () => {
  return (
    <>
      <HeaderWrapper />
      <Box paddingTop={"4rem"}>
        <Create />
      </Box>
    </>
  );
};

export default create;

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      noLayout: true,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

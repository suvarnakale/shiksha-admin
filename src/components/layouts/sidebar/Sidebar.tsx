import React, { useState } from "react";
import NextLink from "next/link";
import PropTypes from "prop-types";
import {
  Box,
  Drawer,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography
} from "@mui/material";
import FeatherIcon from "feather-icons-react";
import LogoIcon from "../logo/LogoIcon";
import Menuitems from "./MenuItems";
import Buynow from "./Buynow";
import { useRouter } from "next/router";
import theme from "@/components/theme/theme";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useTranslation } from "next-i18next";

const Sidebar = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
}: any) => {
  const [open, setOpen] = useState<number | null>(null);

  const { t } = useTranslation();
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const router = useRouter();
  const location = router.pathname;

  const handleClick = (index: number) => {
    setOpen((prevOpen) => (prevOpen === index ? null : index));
  };

  const SidebarContent = (
    <Box p={2} height="100%">
      <LogoIcon />
      <Box mt={2}>
        <List>
          {Menuitems.map((item, index) => (
            <List component="li" disablePadding key={item.title}>
              <ListItem
                button
                onClick={() => {
                  if (item.subOptions) {
                    handleClick(index);
                  } else {
                    router.push(item.href);
                    onSidebarClose();
                  }
                }}
                selected={location === item.href}
                sx={{
                  mb: 1,
                  ...(location === item.href && {
                    color: "white",
                    backgroundColor: (theme) =>
                      `${theme.palette.primary.main}!important`,
                  }),
                }}
              >
                <ListItemIcon>
                  <FeatherIcon icon={item.icon} />
                </ListItemIcon>
                <ListItemText>
                  <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
                    {t(item.title)}
                  </Typography>
                </ListItemText>
                {item.subOptions ? (
                  open === index ? <ExpandLess /> : <ExpandMore />
                ) : null}
              </ListItem>

              {item.subOptions && (
                <Collapse in={open === index} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subOptions.map((subItem) => (
                      <ListItem
                        button
                        key={subItem.title}
                        onClick={() => {
                          router.push(subItem.href);
                          onSidebarClose();
                        }}
                        selected={location === subItem.href}
                        sx={{
                          pl: 8,
                          mb: 1,
                          ...(location === subItem.href && {
                            color: "white",
                            backgroundColor: (theme) =>
                              `${theme.palette.primary.main}!important`,
                          }),
                        }}
                      >
                        <ListItemText>{t(subItem.title)}</ListItemText>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </List>
          ))}
        </List>
      </Box>
      <Buynow />
    </Box>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        open={isSidebarOpen}
        variant="persistent"
        PaperProps={{
          sx: {
            width: "265px",
            border: "0 !important",
            boxShadow: "0px 7px 30px 0px rgb(113 122 131 / 11%)",
          },
        }}
      >
        {SidebarContent}
      </Drawer>
    );
  }
  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      PaperProps={{
        sx: {
          width: "265px",
          border: "0 !important",
        },
      }}
      variant="temporary"
    >
      {SidebarContent}
    </Drawer>
  );
};

Sidebar.propTypes = {
  isMobileSidebarOpen: PropTypes.bool,
  onSidebarClose: PropTypes.func,
  isSidebarOpen: PropTypes.bool,
};

export default Sidebar;

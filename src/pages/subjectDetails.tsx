import React, { useState, useEffect, MouseEvent } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Card as MuiCard,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  MenuItem,
  Select,
  Divider,
  Tooltip,
} from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsertLinkOutlinedIcon from "@mui/icons-material/InsertLinkOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import cardData from "@/data/cardData";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import FilterSearchBar from "@/components/FilterSearchBar";
import Loader from "@/components/Loader";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { getFrameworkDetails } from "@/services/coursePlanner";
import coursePlannerStore from "@/store/coursePlannerStore";
import taxonomyStore from "@/store/tanonomyStore";
import {
  filterAndMapAssociations,
  findCommonAssociations,
  getAssociationsByCodeNew,
  getOptionsByCategory,
} from "@/utils/Helper";

// Define Card interface
interface Card {
  id: number;
  state: string;
  boardsUploaded: number;
  totalBoards: number;
  boards: string[];
  subjects: string[];
}

interface FoundCard {
  id: string;
  state: string;
  boardsUploaded: number;
  totalBoards: number;
  details: string;
  boards: string[];
  subjects: string[];
}

const SubjectDetails = () => {
  const router = useRouter();
  const { boardDetails, boardName } = router.query as {
    boardDetails?: any;
    boardName?: any;
  };
  const tStore = taxonomyStore();
  const store = coursePlannerStore();
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<Card | null>(null);
  const [subject, setSubject] = useState<any>();
  const [boardAssociations, setBoardAssociations] = useState<any[]>([]);
  const [medium, setMedium] = useState<any>([]);
  const [mediumOptions, setMediumOptions] = useState<any[]>([]);
  const [selectedmedium, setSelectedmedium] = useState<any>();
  const [mediumAssociations, setMediumAssociations] = useState<any[]>([]);
  const [gradeAssociations, setGradeAssociations] = useState<any[]>([]);
  const [typeAssociations, setTypeAssociations] = useState<any[]>([]);
  const [grade, setGrade] = useState<any>([]);
  const [selectedgrade, setSelectedgrade] = useState<any>();
  const [gradeOptions, setGradeOptions] = useState<any[]>([]);
  const [typeOptions, setTypeOptions] = useState<any[]>([]);
  const [type, setType] = useState<any>([]);
  const [selectedtype, setSelectedtype] = useState<any>();
  const setTaxanomySubject = coursePlannerStore(
    (state) => state.setTaxanomySubject
  );
  const setTaxonomyMedium = taxonomyStore((state) => state.setTaxonomyMedium);
  const setTaxonomyGrade = taxonomyStore((state) => state.setTaxonomyGrade);
  const setTaxonomyType = taxonomyStore((state) => state.setTaxonomyType);
  const setTaxonomySubject = taxonomyStore((state) => state.setTaxonomySubject);

  useEffect(() => {
    const subjects = localStorage.getItem("overallCommonSubjects");

    if (subjects) {
      try {
        const parsedData = JSON.parse(subjects);
        setSubject(parsedData);
      } catch (error) {
        console.error("Failed to parse subjects from localStorage:", error);
      }
    } else {
      console.log("No subjects found in localStorage.");
      setSubject([]);
    }
  }, []);

  useEffect(() => {
    const fetchFrameworkDetails = async () => {
      if (typeof boardDetails === "string") {
        try {
          const getMedium = await getOptionsByCategory(
            store?.framedata,
            "medium"
          );
          const boardAssociations = await getAssociationsByCodeNew(
            store?.boards,
            boardName
          );
          setBoardAssociations(boardAssociations);
          const commonMediumInState = getMedium
            .filter((item1: { code: string }) =>
              store?.stateassociations.some(
                (item2: { code: string; category: string }) =>
                  item2.code === item1.code && item2.category === "medium"
              )
            )
            .map(
              (item1: { name: string; code: string; associations: any[] }) => ({
                name: item1.name,
                code: item1.code,
                associations: item1.associations,
              })
            );

          const commonMediumInBoard = getMedium
            .filter((item1: { code: any }) =>
              boardAssociations.some(
                (item2: { code: any; category: string }) =>
                  item2.code === item1.code && item2.category === "medium"
              )
            )
            .map((item1: { name: any; code: any; associations: any }) => ({
              name: item1.name,
              code: item1.code,
              associations: item1.associations,
            }));
          console.log(`commonMediumInState`, commonMediumInState);
          console.log(`commonMediumInBoard`, commonMediumInBoard);

          const commonMediumData = findCommonAssociations(
            commonMediumInState,
            commonMediumInBoard
          );
          setMediumOptions(commonMediumData);
          setMedium(commonMediumInState);
        } catch (err) {
          console.error("Failed to fetch framework details");
        } finally {
          setLoading(false);
        }
      } else {
        console.error("Invalid boardId");
        setLoading(false);
      }
    };

    fetchFrameworkDetails();
  }, [boardName]);

  if (loading) {
    return <Loader showBackdrop={true} loadingText="Loading..." />;
  }

  const handleBackClick = () => {
    router.back();
  };

  const handleCopyLink = (subject: any) => {};

  const handleCardClick = (subject: any) => {
    setTaxonomySubject(subject?.name);
    router.push(`/importCsv?subject=${encodeURIComponent(subject?.name)}`);

    setTaxanomySubject(subject?.name);
  };

  const handleMediumChange = (event: any) => {
    const medium = event.target.value;
    setSelectedmedium(medium);
    setTaxonomyMedium(medium);
    setSelectedgrade([null]);
    setSelectedtype([null]);
    setSubject([null]);

    if (medium) {
      const getGrades = getOptionsByCategory(store?.framedata, "gradeLevel");
      const mediumAssociations = getAssociationsByCodeNew(
        mediumOptions,
        medium
      );
      setMediumAssociations(mediumAssociations);

      console.log(getGrades);

      const commonGradeInState = filterAndMapAssociations(
        "gradeLevel",
        getGrades,
        store?.stateassociations,
        "code"
      );
      const commonGradeInBoard = filterAndMapAssociations(
        "gradeLevel",
        getGrades,
        boardAssociations,
        "code"
      );
      const commonGradeInMedium = filterAndMapAssociations(
        "gradeLevel",
        getGrades,
        mediumAssociations,
        "code"
      );

      const commonGradeInStateBoard = findCommonAssociations(
        commonGradeInState,
        commonGradeInBoard
      );
      const overAllCommonGrade = findCommonAssociations(
        commonGradeInStateBoard,
        commonGradeInMedium
      );

      setGrade(overAllCommonGrade);
      setGradeOptions(overAllCommonGrade);
    }
  };

  const handleGradeChange = (event: any) => {
    const grade = event.target.value;
    setTaxonomyGrade(grade);
    setSelectedgrade(grade);
    if (grade) {
      const gradeAssociations = getAssociationsByCodeNew(gradeOptions, grade);
      setGradeAssociations(gradeAssociations);
      const type = getOptionsByCategory(store?.framedata, "courseType");
      console.log(type);

      const commonTypeInState = filterAndMapAssociations(
        "courseType",
        type,
        store?.stateassociations,
        "code"
      );
      const commonTypeInBoard = filterAndMapAssociations(
        "courseType",
        type,
        boardAssociations,
        "code"
      );
      const commonTypeInMedium = filterAndMapAssociations(
        "courseType",
        type,
        mediumAssociations,
        "code"
      );
      const commonTypeInGrade = filterAndMapAssociations(
        "courseType",
        type,
        gradeAssociations,
        "code"
      );

      const commonTypeData = findCommonAssociations(
        commonTypeInState,
        commonTypeInBoard
      );
      const commonType2Data = findCommonAssociations(
        commonTypeInMedium,
        commonTypeInGrade
      );
      const commonType3Data = findCommonAssociations(
        commonTypeData,
        commonType2Data
      );

      console.log(`commonTypeOverall`, commonType3Data);
      setTypeOptions(commonType3Data);
      setType(commonType3Data);
    }
  };

  const handleTypeChange = (event: any) => {
    const type = event.target.value;
    setTaxonomyType(type);
    setSelectedtype(type);

    if (type) {
      const typeAssociations = getAssociationsByCodeNew(typeOptions, type);
      setTypeAssociations(typeAssociations);
      const subject = getOptionsByCategory(store?.framedata, "subject");

      console.log(subject);

      const commonTypeInState = filterAndMapAssociations(
        "subject",
        subject,
        store?.stateassociations,
        "code"
      );
      const commonTypeInBoard = filterAndMapAssociations(
        "subject",
        type,
        boardAssociations,
        "code"
      );
      const commonTypeInMedium = filterAndMapAssociations(
        "subject",
        subject,
        mediumAssociations,
        "code"
      );
      const commonTypeInGrade = filterAndMapAssociations(
        "subject",
        subject,
        gradeAssociations,
        "code"
      );
      const commonTypeInType = filterAndMapAssociations(
        "subject",
        subject,
        typeAssociations,
        "code"
      );

      const findCommonAssociations = (array1: any[], array2: any[]) => {
        return array1.filter((item1: { code: any }) =>
          array2.some((item2: { code: any }) => item1.code === item2.code)
        );
      };

      const findOverallCommonSubjects = (arrays: any[]) => {
        const nonEmptyArrays = arrays.filter(
          (array: string | any[]) => array && array.length > 0
        );

        if (nonEmptyArrays.length === 0) return [];

        let commonSubjects = nonEmptyArrays[0];

        for (let i = 1; i < nonEmptyArrays.length; i++) {
          commonSubjects = findCommonAssociations(
            commonSubjects,
            nonEmptyArrays[i]
          );

          if (commonSubjects.length === 0) return [];
        }

        return commonSubjects;
      };

      const arrays = [
        commonTypeInState,
        commonTypeInBoard,
        commonTypeInMedium,
        commonTypeInGrade,
        commonTypeInType,
      ];

      const overallCommonSubjects = findOverallCommonSubjects(arrays);

      setSubject(overallCommonSubjects);
      localStorage.setItem(
        "overallCommonSubjects",
        JSON.stringify(overallCommonSubjects)
      );
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", flexDirection: "row", marginTop: "20px" }}>
        <Box>
          <Select
            value={selectedmedium || ""}
            onChange={handleMediumChange}
            displayEmpty
            inputProps={{ "aria-label": "Medium" }}
            sx={{
              "& .MuiSelect-select": {
                padding: "8px 16px",
                textAlign: "left",
              },
              "& fieldset": {
                border: "none",
              },
              border: "1px solid #3C3C3C",
              borderRadius: "8px",
              marginRight: "16px",
              height: 40,
              width: "170px",
            }}
          >
            <MenuItem value="">
              <Typography>Select Medium</Typography>
            </MenuItem>
            {medium.map((item: any) => (
              <MenuItem key={item.name} value={item.name}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box>
          <Select
            value={selectedgrade || ""}
            onChange={handleGradeChange}
            displayEmpty
            inputProps={{ "aria-label": "Grade" }}
            sx={{
              "& .MuiSelect-select": {
                padding: "8px 16px",
                textAlign: "left",
              },
              "& fieldset": {
                border: "none",
              },
              border: "1px solid #3C3C3C",
              borderRadius: "8px",
              marginRight: "16px",
              height: 40,
              width: "170px",
            }}
          >
            <MenuItem value="">
              <Typography>Select Grade</Typography>
            </MenuItem>
            {grade.map((item: any) => (
              <MenuItem key={item.name} value={item.name}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box>
          <Select
            value={selectedtype || ""}
            onChange={handleTypeChange}
            displayEmpty
            inputProps={{ "aria-label": "Type" }}
            sx={{
              "& .MuiSelect-select": {
                padding: "8px 16px",
                textAlign: "left",
              },
              "& fieldset": {
                border: "none",
              },
              border: "1px solid #3C3C3C",
              borderRadius: "8px",
              height: 40,
              width: "170px",
            }}
          >
            <MenuItem value="">
              <Typography>Select Type</Typography>
            </MenuItem>
            {type.map((item: any) => (
              <MenuItem key={item.name} value={item.name}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",

          marginTop: "16px",
          marginBottom: "16px",
        }}
      >
        <IconButton onClick={handleBackClick}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h2">{boardName}</Typography>
        <Typography variant="h2" sx={{ ml: 1 }}>
          Board
        </Typography>
        <Box sx={{ width: "40px", height: "40px" }}></Box>
      </Box>
      <Divider />
      <Box sx={{ marginTop: "16px" }}>
        {subject && subject.length > 1 ? (
          subject.map((subj: any, index: number) => (
            <MuiCard
              key={index}
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr 1fr",
                padding: "14px",
                cursor: "pointer",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
                borderRadius: "8px",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#EAF2FF",
                  transform: "scale(1.02)",
                },
                marginTop: "12px",
              }}
              onClick={() => handleCardClick(subj)}
            >
              {/* Left Section: Folder Icon and Subject Name */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <FolderOutlinedIcon sx={{ color: "#3C3C3C" }} />
                <Typography variant="h6" noWrap>
                  {subj?.name || "Untitled Subject"}
                </Typography>
              </Box>
            </MuiCard>
          ))
        ) : (
          <Typography
            variant="h4"
            align="center"
            sx={{ marginTop: "24px", color: "#6B7280" }}
          >
            Select Medium, Grade, and Type
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SubjectDetails;

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

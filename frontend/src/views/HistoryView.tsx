import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Box,
  Container,
  Pagination,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import authApi from "../api/AuthApi";
import BaseUI from "./components/BaseUI";

interface Submit {
  id: string;
  id_test: string;
  submit_day: string;
  testName: string;
  numCorrectAnswers: number;
  total_Requirement_to_answer: number;
  time_to_complete: string;
  kind: string;
  tasks: number[];
  type: string;
}

enum TestType {
  READING="reading",
  LISTENING="listening",
  WRITING="writing",
}

function HistoryTable({
  testID = null
}) {

  const navigate = useNavigate();
  const [submits, setSubmits] = useState<Submit[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const typeParam = filterType === "all" ? "" : filterType.toUpperCase();
    axios
      .get(testID ? 
        `${(import.meta as any).env.VITE_BASE_SUBMIT_SERVICE_LINK}/user/test`
      :
        `${(import.meta as any).env.VITE_BASE_SUBMIT_SERVICE_LINK}/user/id/${localStorage.getItem((import.meta as any).env.VITE_LOCAL_STORAGE_USER_ID)}`, 
      testID ? 
      {
        params: { testID, userID: localStorage.getItem((import.meta as any).env.VITE_LOCAL_STORAGE_USER_ID), page: currentPage}
      }
      : {
        params: { type: typeParam, page: currentPage },
      })
      .then((res) => {
        if (res.data?.data?.submits) {
          setSubmits(res.data.data.submits);
          setTotalPages(res.data.data.totalPages);
        } else {
          setSubmits([]);
        }
      })
      .catch((err) => {
        console.error("AxiosError", err);
        setSubmits([]);
      });
  }, [ filterType, currentPage]);

  const handlePageChange = (_: any, page: number) => {
    setCurrentPage(page); // page bằng page backend
  };

  const handleFilterChange = (type: string) => {
    setFilterType(type);
    setCurrentPage(1); // reset về trang 1 khi đổi filter
  };

  return (
    <Paper sx={{ borderRadius: 2, boxShadow: 3 }}>
      {/* Tiêu đề + nút lọc */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid #eee",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Submit History
        </Typography>

        {
          !testID &&
          <Box>
            {["all", "reading", "listening", "writing"].map((type) => (
              <Button
                key={type}
                variant={filterType === type ? "contained" : "outlined"}
                size="small"
                sx={{ mr: 1 }}
                onClick={() => handleFilterChange(type)}
              >
                {type === "all"
                  ? "ALL"
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </Box>
        }
      </Box>

      {/* Bảng dữ liệu */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Submit day</TableCell>
              {!testID && <TableCell>Test name</TableCell>}
              <TableCell>Kind</TableCell>
              <TableCell>Tasks</TableCell>
              <TableCell>Result</TableCell>
              <TableCell>Time taken</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submits.map((submit) => (
              <TableRow key={submit.id}>
                <TableCell>{submit.submit_day}</TableCell>
                {!testID && <TableCell>{submit.testName}</TableCell>}
                <TableCell>{submit.kind}</TableCell>
                <TableCell>{submit.tasks.map((t) => `${t + 1}`).join(", ")}</TableCell>
                <TableCell>
                  {
                    submit.type.toLowerCase() === TestType.WRITING ?
                      `${submit.total_Requirement_to_answer}/${submit.total_Requirement_to_answer}` :
                      `${submit.numCorrectAnswers}/${submit.total_Requirement_to_answer}`
                  }
                </TableCell>
                <TableCell>{submit.time_to_complete}</TableCell>
                <TableCell>
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() =>
                      navigate(`/history/${submit.id}`, {
                        state: { idTest: submit.id_test, tasks: submit.tasks },
                      })
                    }
                  >
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {submits.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages >= 1 && (
        <Stack alignItems="center" sx={{ py: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Stack>
      )}
    </Paper>
  );
}

export default function History({testID = null}) {
  
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
    
  useEffect(() => {

    if (localStorage.getItem((import.meta as any).env.VITE_LOCAL_STORAGE_ACCESS_TOKEN)) {
      authApi.post('/introspect', {
        token: localStorage.getItem((import.meta as any).env.VITE_LOCAL_STORAGE_ACCESS_TOKEN)
      }).then(res => {
        if (!user) {
          axios.get(`${(import.meta as any).env.VITE_BASE_USER_SERVICE_LINK}/${localStorage.getItem((import.meta as any).env.VITE_LOCAL_STORAGE_USER_ID)}`)
            .then(res => {
              setUser(res.data.result);
              setIsLoggedIn(true);
            })
            .catch(err => {
              alert("Login session expired. Please login again.");
              navigate("/home");
            })
        }
      }).catch(err => {
        alert("Login session expired. Please login again.");
        navigate("/home");
      })
    }

  }, [])

  return testID!==null ? (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
      <HistoryTable testID={testID} />
    </Container>
  ) : (
    <BaseUI isLoggedIn={isLoggedIn} user={user}>
      <HistoryTable testID={testID} />
    </BaseUI>
  )
}

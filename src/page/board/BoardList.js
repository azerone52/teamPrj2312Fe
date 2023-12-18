//  앨범 쇼핑몰 첫 페이지 상품 셀렉 페이지
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardFooter,
  CardHeader,
  Center,
  Flex,
  Heading,
  Image,
  SimpleGrid,
  Spinner,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { Search } from "./Search";
import YouTube from "react-youtube";
import { faHeart as emptyHeart } from "@fortawesome/free-regular-svg-icons";
import { faHeart as fullHeart } from "@fortawesome/free-solid-svg-icons";

function LikeContainer({ loggedIn, boardId }) {
  const toast = useToast();
  const [like, setLike] = useState(null);
  // const { boardId } = useParams();

  useEffect(() => {
    axios
      .get(`/api/like/board/${boardId}`)
      .then((response) => setLike(response.data))
      .catch((error) => console.error("Error fetching like data: ", error));
  }, [boardId]);
  //countLike = {reponse.data}
  // axios.get -> repsonse

  if (like === null) {
    return <center Spinner />;
  }
  function handleLike() {
    if (loggedIn) {
      axios
        .post("/api/like", { boardId })
        .then((response) => setLike(response.data))
        .catch(() => console.log("ERROR"))
        .finally(() => console.log("Lucky!!!"));
    } else {
      toast({
        description: "로그인 후 이용가능한 서비스입니다",
        status: "error",
      });
    }
  }

  return (
    // <Flex gap={3} ml={400}>
    <Flex>
      <Tooltip hasArrow label={"로그인 후 이용 가능한 서비스입니다"}>
        <Button
          onClick={handleLike}
          leftIcon={
            like.like ? (
              <FontAwesomeIcon icon={fullHeart} size="xl" />
            ) : (
              <FontAwesomeIcon icon={emptyHeart} size="xl" />
            )
          }
        >
          <Heading fontSize="md">{like.countLike}</Heading>
        </Button>
      </Tooltip>
    </Flex>
  );
}

export function BoardList() {
  const [boardList, setBoardList] = useState([]);
  const navigate = useNavigate();
  const [fileUrl, setFileUrl] = useState();
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const itemsPerPage = 10;
  const [board, setBoard] = useState();
  const [like, setLike] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const toast = useToast();
  // const { id } = useParams();
  // const boardId = id;
  const location = useLocation();

  function sendRefreshToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    console.log("리프레시 토큰: ", refreshToken);

    axios
      .get("/refreshToken", {
        headers: { Authorization: `Bearer ${refreshToken}` },
      })
      .then((response) => {
        console.log("sendRefreshToken()의 then 실행");

        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);

        console.log("토큰들 업데이트 리프레시 토큰: ");
        console.log(response.data.refreshToken);
        setLoggedIn(true);
      })
      .catch((error) => {
        console.log("sendRefreshToken()의 catch 실행");
        localStorage.removeItem("refreshToken");

        setLoggedIn(false);
      });
  }

  useEffect(() => {
    if (localStorage.getItem("accessToken") !== null) {
      console.log(localStorage.getItem("accessToken"));
      axios
        .get("/accessToken", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
        .then((response) => {
          console.log("accessToken then 수행");
          setLoggedIn(true);
          console.log(response.data);
          if (response.data === "ROLE_ADMIN") {
            console.log("setIsAdmin(true) 동작");
            setIsAdmin(true);
          }
        })
        .catch(() => {
          sendRefreshToken(); //TODO: 소셜 멤버인지 체크하는 코드로 대체하기 (NavBar 참조)
          localStorage.removeItem("accessToken");
        })
        .finally(() => console.log("finally loggedIn: ", loggedIn));
    }
    console.log("loggedIn: ", loggedIn);
  }, [location]);

  // useEffect(() => {
  //   axios
  //     .get("/api/like/board/" + id)
  //     .then((response) => setLike(response.data));
  // }, []);
  //
  // if (board === null) {
  //   return <Spinner />;
  // }

  // 검색 조건을 상태로 관리.
  const [searchParams, setSearchParams] = useState({
    title: "",
    albumFormat: "",
    albumDetails: [],
  });

  // 검색 조건을 업데이트하는 함수.
  const handleSearch = (params) => {
    setSearchParams(params);
    setCurrentPage(0); // 검색 시 첫 페이지로 이동.
  };
  useEffect(() => {
    // searchParams 상태를 사용하여 API 호출을 업데이트.
    axios
      .get(`/api/board/list`, {
        params: {
          page: currentPage,
          size: itemsPerPage,
          title: searchParams.title,
          albumFormat: searchParams.format,
          // albumDetails가 undefined가 아닌 경우에만 join을 호출.
          albumDetails: searchParams.genres
            ? searchParams.genres.join(",")
            : "",
          minPrice: searchParams.minPrice,
          maxPrice: searchParams.maxPrice,
          stockQuantity: searchParams.stockQuantity,
        },
      })
      .then((response) => {
        const boards = response.data.content;

        // 각 board 객체에 대해 boardFile의 fileUrl을 추출합니다.
        const updatedBoards = boards.map((board) => {
          // boardFile 객체들이 배열 형태로 저장되어 있다고 가정
          const fileUrls = board.boardFiles.map((file) => file.fileUrl);
          return { ...board, fileUrls };
        });

        setBoardList(updatedBoards);
        setTotalPage(response.data.totalPages);
      });
  }, [currentPage, searchParams]);

  if (boardList === null) {
    return <Spinner />;
  }

  const pageButton = [];
  for (let i = 0; i < totalPage; i++) {
    pageButton.push(
      <Button
        key={i}
        onClick={() => setCurrentPage(i)}
        colorScheme={i === currentPage ? "pink" : "gray"}
      >
        {i + 1}
      </Button>,
    );
  }

  function handlePreviousPage() {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  }

  function handleNextPage() {
    setCurrentPage((prev) => Math.min(prev + 1, totalPage - 1));
  }

  return (
    <>
      <Box>
        <Search onSearch={handleSearch} /> {/* 검색 컴포넌트*/}
        <SimpleGrid
          border="0px solid black"
          placeItems="center"
          templateColumns="repeat(4, 1fr)" // 각 열에 4개의 카드를 나열
          gap={3} // 카드 사이의 간격
        >
          {boardList.map((board) => (
            <Card
              border="1px solid black"
              key={board.fileUrl}
              style={{ width: "100%" }}
              onClick={() => navigate(`/board/${board.id}`)}
            >
              <CardHeader>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {board.fileUrls &&
                    board.fileUrls.map((url, index) => (
                      <Image
                        key={index}
                        src={url}
                        borderRadius="ml"
                        border="1px solid black"
                        style={{
                          width: "200px",
                          height: "200px",
                          objectFit: "cover",
                        }}
                      />
                    ))}
                </div>
                <div>
                  <Heading size="md">{board.title}</Heading>
                  <Heading size="m">{board.artist}</Heading>
                  {/*<Heading size="m">{board.price}</Heading>*/}
                  {/*<Heading size="s">{board.releaseDate}</Heading>*/}
                  {/*<Heading size="s">{board.albumFormat}</Heading>*/}
                </div>
              </CardHeader>
              {/*<CardBody>*/}
              {/*  <Text>{board.content}</Text>*/}
              {/*</CardBody>*/}
              <CardFooter>
                <LikeContainer loggedIn={loggedIn} boardId={board.id} />
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
        {/*-----------------------------------------*/}
        {/*페이지 네이션-------------------------------------------*/}
        <Center>
          <ButtonGroup>
            <Button onClick={handlePreviousPage} disable={currentPage === 0}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </Button>
            {pageButton}
            <Button
              onClick={handleNextPage}
              e
              disabled={currentPage === totalPage - 1}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </Button>
          </ButtonGroup>
        </Center>
        <SimpleGrid minChildWidth="90px">
          <Box>
            <YouTube
              videoId="2kCQEnm8nAg" //비디오 영상 주소
              opts={{
                width: "100%",
                height: "270px",
                playerVars: {
                  autoplay: 1, //자동 재생 여부
                  modestbranding: 1, //컨트롤 바에 유튜브 로고 표시 여부
                  loop: 1, //반복 재생
                  playlist: "2kCQEnm8nAg", //반복 재생으로 재생할 플레이 리스트
                },
              }}
              onReady={(e) => {
                e.target.mute(); //소리 끔
              }}
            />
          </Box>

          <Box>
            <YouTube
              videoId="2kCQEnm8nAg" //비디오 영상 주소
              opts={{
                width: "100%",
                height: "270px",
                playerVars: {
                  autoplay: 1, //자동 재생 여부
                  modestbranding: 1, //컨트롤 바에 유튜브 로고 표시 여부
                  loop: 1, //반복 재생
                  playlist: "2kCQEnm8nAg", //반복 재생으로 재생할 플레이 리스트
                },
              }}
              onReady={(e) => {
                e.target.mute(); //소리 끔
              }}
            />
          </Box>
        </SimpleGrid>
        {/*<CommentComponent />*/}
      </Box>
    </>
  );
}

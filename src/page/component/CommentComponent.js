import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Center,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  StackDivider,
  Text,
  Textarea,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CommentContent({
  comment,
  onDeleteModalOpen,
  isSubmitting,
  setIsSubmitting,
  userLogId,
  isAdmin,
  sendRefreshToken,
  setAccessToken,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [commentEdit, setCommentEdit] = useState(comment.content);
  const toast = useToast();
  // const [loggedIn, setLoggedIn] = useState(false);

  const commentUpdate = {
    updateTime: comment.updateTime,
  };
  const updateTime = new Date(comment.updateTime);

  const commentUpdateTime = updateTime
    .toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(/(\d+)\/(\d+)\/(\d+),?/, "$3/$1/$2");

  function handleSubmit() {
    setIsSubmitting(true);
    axios
      .put(
        "/api/comment/update/" + comment.id,
        {
          id: comment.id,
          content: commentEdit,
          member: { logId: comment.member.logId },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      )
      .then(() =>
        toast({
          description: "리뷰가 수정 되었습니다.",
          status: "success",
        }),
      )
      .catch(() => {
        const re = sendRefreshToken();
        re.then(() =>
          axios
            .put(
              "/api/comment/update/" + comment.id,
              {
                id: comment.id,
                content: commentEdit,
                member: { logId: comment.member.logId },
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken",
                  )}`,
                },
              },
            )
            .then(() =>
              toast({
                description: "리뷰가 수정 되었습니다.",
                status: "success",
              }),
            )
            .catch(() =>
              toast({
                description: "수정 중 문제가 발생하였습니다.",
                status: "error",
              }),
            )
            .finally(() => setIsSubmitting(false)),
        );
      })
      .finally(() => {
        setIsSubmitting(false);
        setIsEditing(false);
      });
  }

  return (
    <Box>
      <Flex justifyContent="space-between">
        <Text size={10} fontSize="sm" color="dimgrey">
          {comment.member.logId}님
        </Text>
        <Text fontSize="xs" color="gray">
          {/*{comment.updateTime}*/}
          {commentUpdateTime}
        </Text>
      </Flex>
      <Flex justifyContent="space-between" alignItems="center">
        <Box flex={1}>
          {/*{!isEditing && (*/}
          <Text sx={{ whiteSpace: "pre-wrap" }} pt="2" fontSize="medium">
            {comment.content}
          </Text>
          {/*)}*/}

          {isEditing && (
            <Box>
              <Textarea
                value={commentEdit}
                onChange={(e) => setCommentEdit(e.target.value)}
              />
              <Button
                colorScheme="pink"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                저장
              </Button>
            </Box>
          )}
        </Box>

        <Box>
          {comment.member.logId === userLogId && !isEditing && (
            <Button
              size="xs"
              colorScheme="blue"
              onClick={() => setIsEditing(true)}
            >
              수정
            </Button>
          )}
          {isEditing && (
            <Button
              size="xs"
              colorScheme="red"
              onClick={() => setIsEditing(false)}
            >
              취소
            </Button>
          )}
          {(comment.member.logId === userLogId || isAdmin) && (
            <Button size="xs" onClick={() => onDeleteModalOpen(comment.id)}>
              삭제
            </Button>
          )}
        </Box>
      </Flex>
    </Box>
  );
}

function CommentList({
  commentList,
  onDeleteModalOpen,
  isSubmitting,
  setIsSubmitting,
  userLogId,
  isAdmin,
  sendRefreshToken,
  setAccessToken,
}) {
  const toast = useToast();

  return (
    <Center mt="20">
      <Card w="xl">
        <CardHeader>
          <Heading size="sm">REVIEW</Heading>
        </CardHeader>
        <CardBody>
          <Stack divider={<StackDivider />} spacing="3">
            {commentList &&
              commentList.map((comment) => (
                <CommentContent
                  key={comment.id}
                  comment={comment}
                  isSubmitting={isSubmitting}
                  setIsSubmitting={setIsSubmitting}
                  onDeleteModalOpen={onDeleteModalOpen}
                  userLogId={userLogId}
                  isAdmin={isAdmin}
                  sendRefreshToken={sendRefreshToken}
                  setAccessToken={setAccessToken}
                />
              ))}
          </Stack>
        </CardBody>
      </Card>
    </Center>
  );
}

function CommentForm({ boardId, isSubmitting, onSubmit }) {
  const [content, setContent] = useState("");

  const toast = useToast();

  function handleSubmit() {
    onSubmit({ content });
  }
  return (
    <Box>
      <Textarea
        placeholder="리뷰를 작성해주세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></Textarea>
      <Button onClick={handleSubmit} isDisabled={isSubmitting}>
        {/*버튼 활성화*/}
        작성
      </Button>
    </Box>
  );
}

function CommentComponent({ boardId, loggedIn, userLogId, isAdmin }) {
  const [isSubmitting, setIsSubmitting] = useState(false); //제출이 됐는지 알 수 있는 상태를 씀
  //submit했으면 isDisabled가 true되도록 설정

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const commentPerPage = 10;

  // const [id, setId] = useState(0); //id를 렌더링 할 필요없는 경우 useState쓸 필요없음
  const commentIdRef = useRef(0); // current를 통해 현재 참조하는 값을 가져오거나 변경
  const toast = useToast();
  let navigate = useNavigate();
  const [commentList, setCommentList] = useState([]);

  const { isOpen, onClose, onOpen } = useDisclosure();
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken"),
  );

  useEffect(() => {
    if (!isSubmitting) {
      const params = new URLSearchParams();
      params.set("id", boardId); //url에서 id에 boardId가 들어감
      params.set("page", currentPage);
      params.set("size", commentPerPage);

      axios.get("/api/comment/list?" + params).then((response) => {
        setCommentList(response.data.content);
        setTotalPage(response.data.totalPages);
      });
    }
  }, [isSubmitting, boardId, currentPage, accessToken]); //pageSize 삭제

  const pageButton = [];
  for (let i = 0; i < totalPage; i++) {
    pageButton.push(
      <Button
        key={i}
        size="sm"
        onClick={() => setCurrentPage(i)}
        colorScheme={i === currentPage ? "orange" : "gray"}
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

  function sendRefreshToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    console.log("리프레시 토큰: ", refreshToken);
    if (refreshToken !== null) {
      return axios
        .get("/refreshToken", {
          headers: { Authorization: `Bearer ${refreshToken}` },
        })
        .then((response) => {
          console.log("sendRefreshToken()의 then 실행");
          localStorage.setItem("accessToken", response.data.accessToken);
          localStorage.setItem("refreshToken", response.data.refreshToken);

          setAccessToken(localStorage.getItem("accessToken"));
          console.log("토큰들 업데이트 리프레시 토큰: ");
          console.log(response.data.refreshToken);
        })
        .catch((error) => {
          console.log("sendRefreshToken()의 catch 실행");
          localStorage.removeItem("refreshToken");
          toast({
            description: "로그인 되어 있지 않습니다.",
            status: "warning",
          });
          navigate(0);
        });
    }
  }
  function handleSubmit({ content }) {
    setIsSubmitting(true);
    console.log(content);
    axios
      .post(
        `/api/comment/add/${boardId}`,
        { content },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      )
      .then(() => {
        toast({
          description: "리뷰가 저장되었습니다.",
          status: "success",
        });
      })
      .catch((error) => {
        console.log("리프레시 토큰 보내기");
        const re = sendRefreshToken();
        if (re !== undefined) {
          re.then(() => {
            axios
              .post(
                `/api/comment/add/${boardId}`,
                { content },
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                      "accessToken",
                    )}`,
                  },
                },
              )
              .then(() => {
                toast({
                  description: "리뷰가 저장되었습니다.",
                  status: "success",
                });
              })
              .catch((error) => {
                if (error.response.status === 401) {
                  toast({
                    description: "로그인이 필요합니다.",
                    status: "error",
                  });
                } else {
                  toast({
                    description: "저장 중 문제가 발생하였습니다.",
                    status: "error",
                  });
                }
              })
              .finally(() => setIsSubmitting(false));
          });
        }
      })
      .finally(() => {
        setIsSubmitting(false); //제출 완료되면 버튼 활성화
      });
  }

  function handleDelete() {
    setIsSubmitting(true);
    axios
      .delete("/api/comment/delete/" + commentIdRef.current, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(() => {
        toast({
          description: "리뷰를 삭제하였습니다.",
          status: "success",
        });
      })
      .catch(() => {
        const re = sendRefreshToken();
        if (re !== undefined) {
          re.then(() =>
            axios
              .delete("/api/comment/delete/" + commentIdRef.current, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken",
                  )}`,
                },
              })
              .then(() => {
                toast({
                  description: "리뷰를 삭제하였습니다.",
                  status: "success",
                });
              })
              .catch(() =>
                toast({
                  description: "삭제 중 문제가 발생하였습니다.",
                  status: "error",
                }),
              )
              .finally(() => {
                setIsSubmitting(false);
              }),
          );
        }
      })
      .finally(() => {
        onClose();
        setIsSubmitting(false);
      });
  }

  function handleDeleteModalOpen(id) {
    //모달이 열릴때 아이디 저장
    commentIdRef.current = id;
    onOpen(); //모달 열기
  }

  return (
    <Box>
      {/*댓글 바로 올라가도록 하려면 CommentForm의 상태를 CommentList가 알도록 해야함.
       부모인 Comment컴포넌트가 그 상태를 갖고있으면 됨. 그리고 prop으로 받기*/}
      {loggedIn && (
        <Center mt="10">
          <Box w="xl">
            <CommentForm
              boardId={boardId}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          </Box>
        </Center>
      )}

      <CommentList
        boardId={boardId}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
        commentList={commentList}
        onDeleteModalOpen={handleDeleteModalOpen}
        userLogId={userLogId}
        isAdmin={isAdmin}
        sendRefreshToken={sendRefreshToken}
        setAccessToken={setAccessToken}
      />

      {/*삭제 모달*/}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>삭제 확인</ModalHeader>
          <ModalCloseButton />
          <ModalBody>삭제 하시겠습니까?</ModalBody>

          <ModalFooter>
            <Button onClick={onClose}>닫기</Button>
            <Button
              isDisabled={isSubmitting}
              onClick={handleDelete}
              colorScheme="red"
            >
              삭제
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Center>
        <ButtonGroup mt={20}>
          <Button
            onClick={handlePreviousPage}
            disable={currentPage === 0}
            size="sm"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </Button>
          {pageButton}
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPage - 1}
            size="sm"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </Button>
        </ButtonGroup>
      </Center>
    </Box>
  );
}

export default CommentComponent;

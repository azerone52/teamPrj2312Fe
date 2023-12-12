import React from "react";
import Category_CD from "./page/item/Category_CD";
// import { ItemAllPage } from "./component/ItemAllPage";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { HomeLayout } from "./page/layout/HomeLayout";
import { MemberSignup } from "./page/member/MemberSignup";
import { MemberView } from "./page/member/MemberView";
import { MemberEdit } from "./page/member/MemberEdit";
import { MemberList } from "./page/member/MemberList";
import { MemberLogin } from "./page/member/MemberLogin";
import { MemeberSocialLogin } from "./MemeberSocialLogin";
import { BoardList } from "./page/board/BoardList";
import { BoardWrite } from "./page/board/BoardWrite";
// import { HomeLayout } from "./layout/HomeLayout";
import { BoardView } from "./page/board/BoardView";
import { BoardEdit } from "./page/board/BoardEdit";
import { OrderWrite } from "./page/order/OrderWrite";
import Payment from "./page/payment/Payment";
import { Success } from "./page/payment/Success";
import { Fail } from "./page/payment/Fail";

const routes = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<HomeLayout />}>
      <Route index element={<BoardList />} />
      <Route path="write" element={<BoardWrite />} />
      <Route path="board/:id" element={<BoardView />} />
      <Route path="edit/:id" element={<BoardEdit />}></Route>
      <Route path="signup" element={<MemberSignup />}></Route>
      <Route path="member/list" element={<MemberList />} />
      <Route path="member" element={<MemberView />} />
      <Route path="medit/:id" element={<MemberEdit />} />
      <Route path="login" element={<MemberLogin />} />
      <Route path="loginprocess/:type" element={<MemeberSocialLogin />} />
      <Route path="order" element={<OrderWrite />} />
      <Route path="payment" element={<Payment />} />
      <Route path="success" element={<Success />} />
      <Route path="fail" element={<Fail />} />
    </Route>,
  ),
);

function App() {
  return <RouterProvider router={routes} />;
}

export default App;

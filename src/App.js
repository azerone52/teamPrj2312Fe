import React from "react";
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider,} from "react-router-dom";
import {BoardList} from "./page/board/BoardList";
import {BoardWrite} from "./page/board/BoardWrite";
import {HomeLayout} from "./layout/HomeLayout";


const routes = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<HomeLayout />}>
            <Route index element={<BoardList />} />
            <Route path="write" element={<BoardWrite />} />
            {/*<Route path="board/:id" element={<BoardView />} />*/}
            {/*<Route path="edit/:id" element={<BoardEdit />}></Route>*/}
            {/*<Route path="signup" element={<MemberSignup />} />*/}
            {/*<Route path="member/list" element={<MemberList />} />*/}
            {/*<Route path="member" element={<MemberView />} />*/}
            {/*<Route path="member/edit" element={<MemberEdit />} />*/}
            {/*<Route path="login" element={<MemberLogin />} />*/}
        </Route>,
    ),
);

function App(props) {
    return (
        // <LoginProvider>
            <RouterProvider router={routes} />
        // </LoginProvider>
    );
}

export default App;


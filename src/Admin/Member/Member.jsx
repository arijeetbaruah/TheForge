import React from 'react'
import {Route, Routes} from "react-router-dom";

import MemberList from "./MemberList";

class Member extends React.Component {
    render() {
        return (
            <Routes>
                <Route path="list" element={<MemberList />} />
                <Route path="new" element={<div>Dashboard List</div>} />
                <Route path="edit/*" element={<div>Dashboard List</div>} />
            </Routes>
        )
    }
}

export default Member

import React from 'react'
import { Navbar, Nav, Button } from 'react-bootstrap'
import { Link, Routes, Route } from 'react-router-dom'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.min.css'
import s from '../styles/AdminDashboard.module.scss'

import Member from './Member/Member.jsx'

class AdminDashboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = { sidebarOpen: true, activeNav: 'Dashboard' };
    }

    toggleSidebar = () => this.setState(prev => ({ sidebarOpen: !prev.sidebarOpen }));
    setActive     = item => this.setState({ activeNav: item });

    render() {
        const { sidebarOpen, activeNav } = this.state;

        return (
            <div className={s.wrapper}>

                {/* ── Sidebar ── */}
                <aside className={`${s.sidebar} ${!sidebarOpen ? s.collapsed : ''}`}>
                    <Navbar className={s.sidebarNavbar}>
                        <Navbar.Brand href="/" className={s.brandLink}>
                            <i className={`bi bi-lightning-charge-fill ${s.brandIcon}`} />
                            <span>The Forge</span>
                        </Navbar.Brand>
                    </Navbar>

                    <div className={s.sidebarNav}>
                        <div className={s.navHeader}>Navigation</div>
                        <Nav className="flex-column">
                            <Nav.Item>
                                <button className={`${s.navItemLink} ${activeNav === 'Dashboard' ? s.active : ''}`} onClick={() => this.setActive('Dashboard')}>
                                    <i className="bi bi-speedometer2" /><span>Dashboard</span>
                                </button>
                            </Nav.Item>
                            <Nav.Item>
                                <Link className={`${s.navItemLink} ${activeNav === 'Users' ? s.active : ''}`} to="/admin/member/list" onClick={() => this.setActive('Users')}>
                                    <i className="bi bi-people" /><span>Users</span>
                                </Link>
                            </Nav.Item>
                        </Nav>
                    </div>
                </aside>

                {/* ── Main area ── */}
                <div className={`${s.mainArea} ${!sidebarOpen ? s.expanded : ''}`}>
                    <Navbar bg="white" className={s.topbar}>
                        <Button variant="light" className={s.toggleBtn} onClick={this.toggleSidebar}>
                            <i className="bi bi-list" />
                        </Button>
                        <Nav className="ms-auto align-items-center">
                            <Button variant="light" className={s.topbarIconBtn}><i className="bi bi-chat-left-text" /></Button>
                            <Button variant="light" className={s.topbarIconBtn}><i className="bi bi-bell" /></Button>
                            <div className={`${s.userAvatar} ms-3`}>AJ</div>
                        </Nav>
                    </Navbar>

                    <main className={s.mainContent}>
                        <Routes>
                            <Route index element={<div>Dashboard Home</div>} />
                            <Route path="member/*" element={<Member />} />
                        </Routes>
                    </main>
                </div>

            </div>
        );
    }
}

export default AdminDashboard;

import React from 'react'
import '../../firebase/auth.js'

import { Table} from 'react-bootstrap'

import UserService from '../../Entity/UserService.js'

class MemberList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            users:   [],
            loading: true,
            error:   null,
        }
    }

    async componentDidMount() {
        try {
            const users = await UserService.getUsers();
            this.setState({ users, loading: false });
        } catch (e) {
            this.setState({ error: e.message, loading: false });
        }
    }

    render() {
        const { users, error } = this.state;

        if (error) return (
            <div className="alert alert-danger m-3">{error}</div>
        );

        console.log(users);

        return (
            <div className="card m-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="card-title mb-0">Users</h3>
                    <span className="badge bg-secondary">{users.length} total</span>
                </div>
                <div className="card-body p-0">
                    <Table className="table table-hover mb-0">
                        <thead>
                        <tr>
                            <th>UID</th>
                            <th>Name</th>
                            <th>Role</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="text-center text-muted py-4">
                                    No users found
                                </td>
                            </tr>
                        ) : users.map(user => (
                            <tr key={user.uid}>
                                <td>
                                    <code style={{ fontSize: '0.8rem' }}>{user.uid}</code>
                                </td>
                                <td>{user.userName}</td>
                                <td>
                                        <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>
                                            {user.role}
                                        </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        )
    }
}

export default MemberList

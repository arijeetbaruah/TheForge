import React from 'react';
import { useMembers } from '../../hooks/useMembers.ts';
import { Member } from '../../types/member.ts';
import { useParams } from 'react-router-dom';
import MemberEditForm from './MemberEditForm';

interface MemberDetailInnerProps {
    member: Member;
    onEditClick: () => void;
}

class MemberDetailInner extends React.Component<MemberDetailInnerProps> {
    render() {
        const { member, onEditClick } = this.props;
        return (
            <div className="memberDetailInner">
                <div>{member.Name}</div>
                <button onClick={onEditClick}>Edit Member</button>
            </div>
        );
    }
}

const MemberDetail: React.FC = () => {
    const { data: membersData, isLoading, error } = useMembers();
    const { id } = useParams<{ id: string }>();

    const [isEditing, setIsEditing] = React.useState(false);
    const [isSaving, setIsSaving]   = React.useState(false);

    const members = (membersData as Member[]) ?? [];
    const member  = members[Number(id)];

    if (isLoading) return <div>Loading…</div>;
    if (error)     return <div>Error: {error.message}</div>;
    if (!member)   return <div>Member not found.</div>;

    const handleSave = async (updated: Member) => {
        setIsSaving(true);
        try {
            // TODO: call your update API here, e.g.:
            // await updateMember(Number(id), updated);
            console.log('Saving member:', updated);
        } finally {
            setIsSaving(false);
            setIsEditing(false);
        }
    };

    return (
        <>
            <MemberDetailInner
                member={member}
                onEditClick={() => setIsEditing(true)}
            />

            {isEditing && (
                <MemberEditForm
                    member={member}
                    onSave={handleSave}
                    onCancel={() => setIsEditing(false)}
                    isSaving={isSaving}
                />
            )}
        </>
    );
};

export default MemberDetail;
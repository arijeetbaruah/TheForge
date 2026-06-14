import React from 'react';
import { ToolProficiency } from "../../types/member.ts";
import styles from './ToolTag.module.scss';

interface ToolTagProps {
    tool: ToolProficiency;
}

class ToolTag extends React.Component<ToolTagProps> {
    render() {
        return (
            <span className={`${styles.tag} ${styles.artisan}`}>
                {this.props.tool}
            </span>
        );
    }
}

export default ToolTag;
import React from 'react';
import {ArtisanTool, Member, OtherTool, ToolProficiency} from '../../types/member';
import _ from "underscore";
import "./Member.scss"

interface MemberEditFormProps {
    member: Member;
    onSave: (updated: Member) => void;
    onCancel: () => void;
    isSaving?: boolean;
}

interface MemberEditFormState {
    form: Member;
    errors: Partial<Record<keyof Member, string>>;
}

const ALL_TOOLS: ToolProficiency[] = [
    ...Object.values(ArtisanTool),
    ...Object.values(OtherTool)
];

const STATS: Array<{ key: keyof Member; label: string; abbr: string }> = [
    { key: 'STR', label: 'Strength',     abbr: 'STR' },
    { key: 'DEX', label: 'Dexterity',    abbr: 'DEX' },
    { key: 'INT', label: 'Intelligence', abbr: 'INT' },
    { key: 'WIS', label: 'Wisdom',       abbr: 'WIS' },
    { key: 'CHA', label: 'Charisma',     abbr: 'CHA' },
];

function modifier(score: number): string {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

class MemberEditForm extends React.Component<MemberEditFormProps, MemberEditFormState> {
    constructor(props: MemberEditFormProps) {
        super(props);
        this.state = {
            form: { ...props.member },
            errors: {},
        };

        this.handleMultiSelectChange = this.handleMultiSelectChange.bind(this);
    }

    private handleTextChange = (field: keyof Member, value: string) => {
        this.setState(prev => ({
            form: { ...prev.form, [field]: value },
            errors: { ...prev.errors, [field]: undefined },
        }));
    };

    private handleStatChange = (field: keyof Member, value: string) => {
        const num = parseInt(value, 10);
        const clamped = isNaN(num) ? 0 : Math.min(30, Math.max(1, num));
        this.setState(prev => ({
            form: { ...prev.form, [field]: clamped },
            errors: { ...prev.errors, [field]: undefined },
        }));
    };

    private validate(): boolean {
        const { form } = this.state;
        const errors: Partial<Record<keyof Member, string>> = {};

        if (!form.Name.trim()) errors.Name = 'Name is required.';
        STATS.forEach(({ key }) => {
            const val = form[key] as number;
            if (val < 1 || val > 30) errors[key] = '1–30';
        });

        this.setState({ errors });
        return Object.keys(errors).length === 0;
    }

    private handleSubmit = () => {
        if (this.validate()) {
            this.props.onSave(this.state.form);
        }
    };

    private handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = Array.from(e.target.options)
            .filter(o => o.selected)
            .map(o => o.value)
            .join(',');
        this.setState(prev => ({
            form: { ...prev.form, Tools: selected },
            errors: { ...prev.errors, Tools: undefined },
        }));
    };

    render() {
        const { onCancel, isSaving } = this.props;
        const { form, errors } = this.state;

        return (
            <>
                <div className="mef-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
                    <div className="mef-sheet" role="dialog" aria-modal="true" aria-label="Edit member">

                        <div className="mef-header">
                            <h2 className="mef-title">Edit Member</h2>
                            <button className="mef-close" onClick={onCancel} aria-label="Close">✕</button>
                        </div>

                        <div className="mef-body">
                            {/* Name */}
                            <div className="mef-field">
                                <label className="mef-label" htmlFor="mef-name">Name</label>
                                <input
                                    id="mef-name"
                                    className={`mef-input${errors.Name ? ' mef-error' : ''}`}
                                    type="text"
                                    value={form.Name}
                                    onChange={e => this.handleTextChange('Name', e.target.value)}
                                    placeholder="Member name"
                                />
                                {errors.Name && <p className="mef-error-msg">{errors.Name}</p>}
                            </div>

                            {/* Tools */}
                            <div className="mef-field">
                                <label className="mef-label" htmlFor="mef-tools">Tools & Proficiencies</label>
                                <select
                                    id="mef-tools"
                                    className="mef-input"
                                    value={form.Tools ? _.map(form.Tools.split(','), val => val.trim()) : []}
                                    multiple={true}
                                    onChange={e => this.handleMultiSelectChange(e)}
                                >
                                    {_.map(ALL_TOOLS, tool => (<option value={tool} key={tool}>{tool}</option>))}
                                </select>
                            </div>

                            <hr className="mef-divider" />

                            {/* Ability Scores */}
                            <p className="mef-section-label">Ability Scores</p>
                            <div className="mef-stats-grid">
                                {STATS.map(({ key, abbr }) => (
                                    <div className="mef-stat-box" key={key}>
                                        <span className="mef-stat-abbr">{abbr}</span>
                                        <input
                                            className={`mef-stat-input${errors[key] ? ' mef-error' : ''}`}
                                            type="number"
                                            min={1}
                                            max={30}
                                            value={form[key] as number}
                                            onChange={e => this.handleStatChange(key, e.target.value)}
                                            aria-label={abbr}
                                        />
                                        <span className="mef-stat-modifier">
                                            {modifier(form[key] as number)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mef-actions">
                                <button className="mef-btn mef-btn-cancel" onClick={onCancel}>
                                    Cancel
                                </button>
                                <button
                                    className="mef-btn mef-btn-save"
                                    onClick={this.handleSubmit}
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </>
        );
    }
}

export default MemberEditForm;
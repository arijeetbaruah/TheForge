import React from 'react'
import { Container } from 'react-bootstrap'

import "./CommissionReceipt.css"

/**
 * CommissionReceipt
 *
 * Props
 * ─────
 * task : {
 *   discordId       : string,
 *   characterName   : string,
 *   category        : { value: string, label: string },
 *   baseItem        : { itemName: string } | null,
 *   enchantment     : { name: string }     | null,
 *   provideBaseItem : boolean,
 * }
 * taskId   : string
 * onBack   : () => void   — called when "Submit another commission" is clicked
 */
class CommissionReceipt extends React.Component {

    render() {
        const { data: { taskId, ...task }, onBack } = this.props;

        return (
            <Container className="page-wrap">
                <div className="parchment">

                    <div className="tear-top" />
                    <div className="tear-bottom" />

                    <div className="corner-ornament tl"><i className="fas fa-fire-flame-curved" /></div>
                    <div className="corner-ornament tr"><i className="fas fa-fire-flame-curved" /></div>
                    <div className="corner-ornament bl"><i className="fas fa-crown" /></div>
                    <div className="corner-ornament br"><i className="fas fa-crown" /></div>

                    <div className="receipt-header">
                        <i className="fas fa-feather fa-xs me-1" />
                        Commission Receipt — The Forge
                    </div>

                    <h1 className="parchment-title">Scroll Received</h1>

                    <div className="receipt-body">

                        <div className="field-line">
                            <span className="field-name"><i className="fas fa-hashtag fa-xs me-1" /> Discord</span>
                            <span className="field-value">{task.discordId}</span>
                        </div>

                        <div className="field-line">
                            <span className="field-name"><i className="fas fa-person fa-xs me-1" /> Character</span>
                            <span className="field-value">{task.character}</span>
                        </div>

                        <div className="field-line">
                            <span className="field-name"><i className="fas fa-tag fa-xs me-1" /> Category</span>
                            <span className="field-value">{task.category?.label ?? '—'}</span>
                        </div>

                        <div className="field-line">
                            <span className="field-name"><i className="fas fa-scroll fa-xs me-1" /> Base Item</span>
                            <span className="field-value">{task.baseItem?.label ?? '—'}</span>
                        </div>

                        <div className="field-line">
                            <span className="field-name"><i className="fas fa-hashtag fa-xs me-1" /> Quantity</span>
                            <span className="field-value">{task.quantity}</span>
                        </div>

                        <div className="field-line">
                            <span className="field-name"><i className="fas fa-wand-sparkles fa-xs me-1" /> Enchantment</span>
                            <span className="field-value">{task.enchantment?.label ?? '—'}</span>
                        </div>

                        <div className="field-line">
                            <span className="field-name"><i className="fas fa-hand-holding fa-xs me-1" /> Providing Item</span>
                            <span className="field-value">{task.providingBase ? 'Aye' : 'Nay'}</span>
                        </div>

                    </div>

                    <div className="ink-divider">
                        <i className="fas fa-hammer fa-xs" />
                    </div>

                    <div className="task-id-wrap">
                        <span className="task-id-label">
                            <i className="fas fa-fingerprint fa-xs me-1" /> Commission Number
                        </span>
                        <span className="task-id">{taskId}</span>
                    </div>

                    <a href="#" className="back-link" onClick={(e) => { e.preventDefault(); onBack?.(); }}>
                        <i className="fas fa-arrow-left fa-xs me-1" /> Submit another commission
                    </a>

                    <p className="parchment-footer">
                        Keep this number — it is your bond with The Forge
                    </p>

                    <div className="wax-stamp">
                        <i className="fas fa-stamp" />
                        FORGE
                    </div>

                </div>
            </Container>
        );
    }
}

export default CommissionReceipt;
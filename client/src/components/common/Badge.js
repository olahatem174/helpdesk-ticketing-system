import React from 'react';
import { STATUS_LABELS, PRIORITY_LABELS, STATUS_COLORS, PRIORITY_COLORS } from '../../utils/helpers';
export const StatusBadge   = ({ status })   => <span className={`badge ${STATUS_COLORS[status]||''}`}>{STATUS_LABELS[status]||status}</span>;
export const PriorityBadge = ({ priority }) => <span className={`badge ${PRIORITY_COLORS[priority]||''}`}>{PRIORITY_LABELS[priority]||priority}</span>;

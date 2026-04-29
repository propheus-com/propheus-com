'use client';

import { use } from 'react';
import ReportForm from '../_components/ReportForm';

export default function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return <ReportForm mode="edit" reportId={id} />;
}

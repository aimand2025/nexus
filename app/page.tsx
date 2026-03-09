'use client';

import { useEffect, useState } from 'react';
import { supabase, logAction } from '@/lib/supabase';
import PiktagSkin from '@/components/skins/PiktagSkin';
import DayinupSkin from '@/components/skins/DayinupSkin';
import DeotengSkin from '@/components/skins/DeotengSkin';
import GathertaiwanSkin from '@/components/skins/GathertaiwanSkin';
import CanvasAnnotator from '@/components/CanvasAnnotator';
import ImperialNotifications from '@/components/ImperialNotifications';

const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || 'piktag';
const SITE_SKIN = process.env.NEXT_PUBLIC_SITE_SKIN || 'piktag';

export default function DashboardSwitcher() {
  const [features, setFeatures] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [annotatingImage, setAnnotatingImage] = useState<{ url: string, featureId: string } | null>(null);

  async function fetchData() {
    const { data: featureData } = await supabase
      .from('features')
      .select('*')
      .eq('project_id', PROJECT_ID)
      .order('created_at', { ascending: false });

    const { data: versionData } = await supabase
      .from('versions')
      .select('*')
      .eq('project_id', PROJECT_ID)
      .order('created_at', { ascending: false });

    const { data: feedbackData } = await supabase
      .from('feedback')
      .select('*')
      .eq('project_id', PROJECT_ID)
      .order('created_at', { ascending: true });

    const { data: auditData } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('project_id', PROJECT_ID)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (featureData) setFeatures(featureData);
    if (versionData) setVersions(versionData);
    if (feedbackData) setFeedbacks(feedbackData);
    if (auditData) setAuditLogs(auditData);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel(`db-changes-${PROJECT_ID}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'features', filter: `project_id=eq.${PROJECT_ID}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'versions', filter: `project_id=eq.${PROJECT_ID}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback', filter: `project_id=eq.${PROJECT_ID}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs', filter: `project_id=eq.${PROJECT_ID}` }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdateStatus = async (featureId: string, newStatus: string) => {
    const oldFeature = features.find(f => f.id === featureId);
    const { error } = await supabase
      .from('features')
      .update({ status: newStatus })
      .eq('id', featureId);
    
    if (!error) {
      await logAction(PROJECT_ID, 'feature', featureId, 'updated', 'Commander', oldFeature, { ...oldFeature, status: newStatus }, `Status changed to ${newStatus}`);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, featureId: string) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      // First, create a temporary URL for annotation
      const tempUrl = URL.createObjectURL(file);
      setAnnotatingImage({ url: tempUrl, featureId });
    } catch (error: any) {
      console.error(error);
      alert(`Upload init failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAnnotation = async (blob: Blob) => {
    if (!annotatingImage) return;
    try {
      setUploading(true);
      const fileName = `${Math.random()}.png`;
      const filePath = `${PROJECT_ID}/annotated/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(filePath, blob, {
          contentType: 'image/png'
        });

      if (uploadError) {
        console.error('Upload Error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from('feedback').insert({
        feature_id: annotatingImage.featureId,
        project_id: PROJECT_ID,
        image_url: publicUrl,
        author: 'Commander',
        text: 'Annotated report'
      });

      if (insertError) {
        console.error('Insert Feedback Error:', insertError);
        throw insertError;
      }

      await logAction(PROJECT_ID, 'feedback', annotatingImage.featureId, 'created', 'Commander', null, { image_url: publicUrl }, 'Uploaded annotated screenshot');
      setAnnotatingImage(null);
    } catch (error: any) {
      console.error(error);
      alert(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSendFeedback = async (featureId: string) => {
    if (!feedbackText.trim()) return;
    const { error } = await supabase.from('feedback').insert({
      feature_id: featureId,
      project_id: PROJECT_ID,
      text: feedbackText,
      author: 'Commander'
    });
    if (!error) {
      setFeedbackText('');
      await logAction(PROJECT_ID, 'feedback', featureId, 'created', 'Commander', null, { text: feedbackText }, 'Sent feedback message');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono text-xs tracking-widest">
        LOADING_{PROJECT_ID.toUpperCase()}_PROTOCOL...
      </div>
    );
  }

  const skinProps = {
    features,
    versions,
    feedbacks,
    auditLogs,
    selectedFeature,
    setSelectedFeature,
    feedbackText,
    setFeedbackText,
    uploading,
    onUploadImage: handleUploadImage,
    onSendFeedback: handleSendFeedback,
    onUpdateStatus: handleUpdateStatus
  };

  return (
    <>
      {SITE_SKIN === 'dayinup' && <DayinupSkin {...skinProps} />}
      {SITE_SKIN === 'deoteng' && <DeotengSkin {...skinProps} />}
      {SITE_SKIN === 'gathertaiwan' && <GathertaiwanSkin {...skinProps} />}
      {SITE_SKIN === 'piktag' && <PiktagSkin {...skinProps} />}
      <ImperialNotifications />
      {annotatingImage && (
        <CanvasAnnotator 
          imageUrl={annotatingImage.url} 
          onSave={handleSaveAnnotation} 
          onCancel={() => setAnnotatingImage(null)} 
        />
      )}
    </>
  );
}
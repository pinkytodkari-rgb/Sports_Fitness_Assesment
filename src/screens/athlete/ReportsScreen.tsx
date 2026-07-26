import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { TopHeader } from '../../components/common/TopHeader';
import { Toast } from '../../components/common/Toast';
import { GradientButton } from '../../components/common/GradientButton';
import reportsData from '../../data/reports.json';

export const ReportsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleDownload = (reportName: string) => {
    setToastMessage(`Downloaded ${reportName} PDF successfully!`);
    setToastVisible(true);
  };

  const handleShare = async (reportName: string) => {
    try {
      await Share.share({
        message: `AthleteAI Scout Report: ${reportName}. Verified Biomechanical Score: 96/100.`,
      });
    } catch (error) {
      setToastMessage('Report link copied to clipboard!');
      setToastVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <TopHeader navigation={navigation} title="Scout Reports & PDFs" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.bannerBox}>
          <Ionicons name="document-text-outline" size={32} color="#38BDF8" />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Official Scout Evaluation Reports</Text>
            <Text style={styles.bannerSub}>
              Verified PDF documents ready for collegiate recruiters and professional scouts.
            </Text>
          </View>
        </View>

        {reportsData.map((rep) => (
          <View key={rep.id} style={styles.reportCard}>
            <View style={styles.cardHeader}>
              <View style={styles.pdfIcon}>
                <Ionicons name="document-attach" size={24} color={colors.accent} />
              </View>

              <View style={styles.titleInfo}>
                <Text style={styles.athleteName}>{rep.athleteName}</Text>
                <Text style={styles.dateMeta}>{rep.sport} • Generated {rep.generatedDate}</Text>
              </View>

              <View style={styles.scoreBadge}>
                <Text style={styles.scoreNum}>{rep.overallScore}</Text>
                <Text style={styles.scoreLbl}>SCORE</Text>
              </View>
            </View>

            <Text style={styles.summaryText}>{rep.summary}</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => handleDownload(`${rep.athleteName}_Report`)}
                style={styles.downloadBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="download-outline" size={16} color={colors.primary} />
                <Text style={styles.btnTextPrimary}>Download PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleShare(`${rep.athleteName}_Report`)}
                style={styles.shareBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="share-social-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.btnTextSecondary}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <GradientButton
          title="Generate Custom Scout Package"
          icon="add-circle-outline"
          onPress={() => {
            setToastMessage('Custom scout PDF package request submitted!');
            setToastVisible(true);
          }}
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 60,
  },
  bannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1F3A',
    borderRadius: borderRadius.card, // 18px
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  bannerSub: {
    color: '#E2E8F0',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.card, // 18px
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdfIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  athleteName: {
    color: colors.primary, // #0B1F3A
    fontSize: 17,
    fontWeight: '700',
  },
  dateMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  scoreBadge: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: '#0B1F3A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNum: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  scoreLbl: {
    color: '#DBEAFE',
    fontSize: 8,
    fontWeight: '700',
  },
  summaryText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginVertical: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: borderRadius.button,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  btnTextPrimary: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: borderRadius.button,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  btnTextSecondary: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});

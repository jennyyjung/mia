import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  getStarterPrompts,
  saveOnboarding,
  submitEntry,
  type EntryResponse,
  type TonePreference,
} from "./src/api";

const MBTI_OPTIONS = ["INTJ", "INFP", "ENTP"];
const ENNEAGRAM_OPTIONS = ["1", "5", "8"];
const BIG_FIVE_OPTIONS = ["OCEAN_HIGH_OPENNESS"];

const TONE_OPTIONS: Array<{ value: TonePreference; label: string }> = [
  { value: "direct", label: "Direct" },
  { value: "really_blunt", label: "Really blunt" },
  { value: "gentle_but_firm", label: "Gentle but firm" },
];

type Stage = "onboarding" | "journal";

export default function App() {
  const userId = useMemo(() => `user_${Date.now()}`, []);

  const [stage, setStage] = useState<Stage>("onboarding");
  const [tone, setTone] = useState<TonePreference>("direct");
  const [mbti, setMbti] = useState<string>("");
  const [enneagram, setEnneagram] = useState<string>("");
  const [bigFive, setBigFive] = useState<string>("");
  const [savingOnboarding, setSavingOnboarding] = useState(false);

  const [starterPrompts, setStarterPrompts] = useState<string[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [entryText, setEntryText] = useState("");
  const [entryResult, setEntryResult] = useState<EntryResponse | null>(null);
  const [submittingEntry, setSubmittingEntry] = useState(false);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (stage !== "journal") {
      return;
    }
    let cancelled = false;
    setLoadingPrompts(true);
    getStarterPrompts()
      .then((data) => {
        if (!cancelled) {
          setStarterPrompts(data.prompts);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingPrompts(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [stage]);

  const canContinueOnboarding = tone.length > 0;
  const canSubmitEntry = entryText.trim().length > 0 && !submittingEntry;

  async function handleContinueOnboarding() {
    setError("");
    setSavingOnboarding(true);
    try {
      await saveOnboarding({
        userId,
        tone,
        mbti: mbti || undefined,
        enneagram: enneagram || undefined,
        bigFive: bigFive || undefined,
        skippedOnboarding: !mbti && !enneagram && !bigFive,
      });
      setStage("journal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed onboarding");
    } finally {
      setSavingOnboarding(false);
    }
  }

  async function handleSubmitEntry() {
    setError("");
    setSubmittingEntry(true);
    try {
      const result = await submitEntry({
        userId,
        text: entryText.trim(),
        starterPrompt: selectedPrompt || undefined,
      });
      setEntryResult(result);
      setEntryText("");
      setSelectedPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit entry");
    } finally {
      setSubmittingEntry(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.appTitle}>MIA</Text>
        <Text style={styles.subtitle}>Hard-truth guidance for real growth.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {stage === "onboarding" ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Onboarding</Text>
            <Text style={styles.label}>Choose tone</Text>
            <View style={styles.chipRow}>
              {TONE_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={tone === option.value}
                  onPress={() => setTone(option.value)}
                />
              ))}
            </View>

            <Text style={styles.label}>MBTI (optional)</Text>
            <View style={styles.chipRow}>
              {MBTI_OPTIONS.map((value) => (
                <Chip
                  key={value}
                  label={value}
                  selected={mbti === value}
                  onPress={() => setMbti(mbti === value ? "" : value)}
                />
              ))}
            </View>

            <Text style={styles.label}>Enneagram (optional)</Text>
            <View style={styles.chipRow}>
              {ENNEAGRAM_OPTIONS.map((value) => (
                <Chip
                  key={value}
                  label={value}
                  selected={enneagram === value}
                  onPress={() => setEnneagram(enneagram === value ? "" : value)}
                />
              ))}
            </View>

            <Text style={styles.label}>Big Five (optional)</Text>
            <View style={styles.chipRow}>
              {BIG_FIVE_OPTIONS.map((value) => (
                <Chip
                  key={value}
                  label="High Openness"
                  selected={bigFive === value}
                  onPress={() => setBigFive(bigFive === value ? "" : value)}
                />
              ))}
            </View>

            <Pressable
              style={[
                styles.primaryButton,
                !canContinueOnboarding && styles.buttonDisabled,
              ]}
              disabled={!canContinueOnboarding || savingOnboarding}
              onPress={handleContinueOnboarding}
            >
              {savingOnboarding ? (
                <ActivityIndicator color="#111317" />
              ) : (
                <Text style={styles.primaryButtonText}>Continue to journal</Text>
              )}
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Journal</Text>
            <Text style={styles.label}>Pick a starter prompt (optional)</Text>

            {loadingPrompts ? (
              <ActivityIndicator color="#ffe9c7" />
            ) : (
              <View style={styles.chipRow}>
                {starterPrompts.map((prompt) => (
                  <Chip
                    key={prompt}
                    label={prompt}
                    selected={selectedPrompt === prompt}
                    onPress={() =>
                      setSelectedPrompt(selectedPrompt === prompt ? "" : prompt)
                    }
                  />
                ))}
              </View>
            )}

            <TextInput
              value={entryText}
              onChangeText={setEntryText}
              multiline
              placeholder={
                selectedPrompt || "Write what happened, what you felt, and what you avoided."
              }
              placeholderTextColor="#9da4b0"
              style={styles.input}
              textAlignVertical="top"
            />

            <Pressable
              style={[styles.primaryButton, !canSubmitEntry && styles.buttonDisabled]}
              disabled={!canSubmitEntry}
              onPress={handleSubmitEntry}
            >
              {submittingEntry ? (
                <ActivityIndicator color="#111317" />
              ) : (
                <Text style={styles.primaryButtonText}>Get AI guidance</Text>
              )}
            </Pressable>

            {entryResult?.guidance ? (
              <View style={styles.guidanceCard}>
                <Text style={styles.guidanceTitle}>AI Hard-Truth Guidance</Text>
                <Text style={styles.guidanceText}>{entryResult.guidance.text}</Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Chip(props: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={props.onPress}
      style={[styles.chip, props.selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, props.selected && styles.chipTextSelected]}>
        {props.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#111317",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 14,
  },
  appTitle: {
    color: "#ffe9c7",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  subtitle: {
    color: "#e6ecf5",
    fontSize: 15,
  },
  card: {
    backgroundColor: "#1b1f27",
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  sectionTitle: {
    color: "#f6f7f9",
    fontSize: 21,
    fontWeight: "700",
  },
  label: {
    color: "#d6dde8",
    fontSize: 13,
    fontWeight: "600",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#3a404d",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    maxWidth: "100%",
  },
  chipSelected: {
    backgroundColor: "#ffe9c7",
    borderColor: "#ffe9c7",
  },
  chipText: {
    color: "#e2e7ef",
    fontSize: 12,
  },
  chipTextSelected: {
    color: "#191d24",
    fontWeight: "700",
  },
  input: {
    minHeight: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3a404d",
    padding: 12,
    color: "#f8f9fb",
    fontSize: 15,
    backgroundColor: "#111317",
  },
  primaryButton: {
    backgroundColor: "#ffe9c7",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 14,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: "#161a20",
    fontSize: 15,
    fontWeight: "800",
  },
  guidanceCard: {
    backgroundColor: "#262d39",
    borderRadius: 12,
    padding: 12,
    gap: 7,
  },
  guidanceTitle: {
    color: "#ffe9c7",
    fontSize: 13,
    fontWeight: "700",
  },
  guidanceText: {
    color: "#f0f4fa",
    fontSize: 14,
    lineHeight: 20,
  },
  error: {
    color: "#ff9fa8",
    fontSize: 13,
    lineHeight: 18,
  },
});

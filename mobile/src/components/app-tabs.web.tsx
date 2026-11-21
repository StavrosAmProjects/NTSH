import { Tabs, TabList, TabTrigger, TabSlot, type TabListProps, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Νέα δοκιμή</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>Αποδείξεις</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  const { ref: _ref, ...pressableProps } = props;
  return (
    <Pressable
      {...pressableProps}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      style={({ pressed }) => [styles.tabButton, isFocused && styles.tabSelected, pressed && styles.tabPressed]}>
      <Text style={[styles.tabText, isFocused && styles.tabTextSelected]}>{children}</Text>
    </Pressable>
  );
}

export function CustomTabList({ children, ...props }: TabListProps) {
  return (
    <View {...props} accessibilityRole="tablist" style={styles.tabList}>
      <Text style={styles.tabBrand}>ens.cy</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { height: '100%' },
  tabList: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#f4f5ef',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#dfe3dc',
  },
  tabBrand: { flex: 1, color: '#176b55', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  tabButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 10 },
  tabSelected: { backgroundColor: '#dcece3' },
  tabPressed: { opacity: 0.75 },
  tabText: { color: '#53625b', fontSize: 13, fontWeight: '600' },
  tabTextSelected: { color: '#176b55', fontWeight: '700' },
});

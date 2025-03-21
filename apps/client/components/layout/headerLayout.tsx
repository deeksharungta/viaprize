import React, { forwardRef, useState } from 'react';
import {
  Avatar,
  Text,
  Group,
  Menu,
  Badge,
  useMantineColorScheme,
  Flex,
  ActionIcon,
  Button,
  Modal,
  Card,
  CopyButton,
  Tooltip,
} from '@mantine/core';
import Link from 'next/link';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import {
  IconArrowsLeftRight,
  IconCheck,
  IconCopy,
  IconMoonStars,
  IconSearch,
  IconSignRight,
  IconSun,
  IconUser,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { IoExit } from 'react-icons/io5';
import useAppUser from '@/context/hooks/useAppUser';
import SwitchAccount from './switchWallet';

function getEmailInitials(email: string) {
  const [username, domain] = email.split('@');
  const usernameInitial = username.slice(0, 5);
  const domainInitial = domain.charAt(0);

  return usernameInitial + domainInitial;
}

export default function HeaderLayout() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  const { wallets } = useWallets();
  const displayAddress = (address: string) => {
    return `${address.slice(0, 4)}....${address.slice(-4)}`;
  };

  return (
    <Flex
      justify="space-between"
      align="center"
      sx={{
        width: '100%',
      }}
    >
      <div>Image</div>

      <Flex align="center" gap="md">
        <Card py="5px">
          <Group>
            {wallets[0] ? displayAddress(wallets[0].address) : 'No Wallet'}
            {wallets[0] && (
              <CopyButton value={wallets[0].address}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                    <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                      {copied ? <IconCheck size="1rem" /> : <IconCopy size="1rem" />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            )}
          </Group>
        </Card>
        <ActionIcon
          variant="outline"
          color={dark ? 'yellow.7' : 'blue.8'}
          onClick={() => toggleColorScheme()}
          title="Toggle color scheme"
        >
          {dark ? <IconSun size="1.1rem" /> : <IconMoonStars size="1.1rem" />}
        </ActionIcon>
        <ProfileMenu />
      </Flex>
    </Flex>
  );
}

function ProfileMenu() {
  const { authenticated } = usePrivy();
  const { logoutUser, appUser } = useAppUser();

  const router = useRouter();
  const [switchWallet, setSwitchWallet] = useState(false);
  const handleLogout = () => {
    try {
      toast.promise(logoutUser(), {
        loading: 'Logging out',
        success: 'Logged out',
        error: 'Error logging out',
      });
    } catch {
      toast.error('Error logging out');
    }
  };
  const { wallets } = useWallets();
  return (
    <>
      <Group position="center">
        <Menu withArrow trigger="hover" openDelay={100} closeDelay={400}>
          <Menu.Target>
            {appUser ? (
              <Badge variant="filled" size="xl" radius="sm" className="cursor-pointer">
                {getEmailInitials(appUser.email)}
              </Badge>
            ) : (
              <Avatar color="cyan" radius="xl" className="cursor-pointer" />
            )}
          </Menu.Target>
          <Menu.Dropdown p="md" mr="sm">
            <Menu.Label>Profile</Menu.Label>
            {authenticated ? (
              <Menu.Item
                icon={<IconUser size={14} />}
                onClick={() => {
                  router.push('/profile');
                }}
              >
                View Profile
              </Menu.Item>
            ) : null}
            {/* <Menu.Item icon={<IconMessageCircle size={14} />}>Messages</Menu.Item>
          <Menu.Item icon={<IconPhoto size={14} />}>Gallery</Menu.Item> */}
            <Menu.Item
              icon={<IconSearch size={14} />}
              rightSection={
                <Text size="xs" color="dimmed" pl="sm">
                  ⌘K
                </Text>
              }
            >
              Search
            </Menu.Item>
            <Menu.Divider />

            {/* <Menu.Label>Danger zone</Menu.Label> */}
            <Menu.Item
              onClick={() => setSwitchWallet(true)}
              icon={<IconArrowsLeftRight size={14} />}
            >
              Switch Wallet
            </Menu.Item>
            {authenticated ? (
              <Menu.Item color="red" icon={<IoExit size={14} />} onClick={handleLogout}>
                Logout
              </Menu.Item>
            ) : (
              <Menu.Item
                color="green"
                icon={<IconUser size={14} />}
                onClick={() => {
                  router.push('/');
                }}
              >
                Login
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      </Group>
      <Modal
        size="lg"
        opened={switchWallet}
        onClose={() => setSwitchWallet(false)}
        title="Switch Wallets"
      >
        <SwitchAccount />
      </Modal>
    </>
  );
}

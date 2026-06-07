import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Drop-in replacements for next/navigation — locale-aware
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
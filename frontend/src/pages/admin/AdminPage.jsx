import { Logo } from '../../components/Icons'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { api, errorText } from '../../api/client'
import { useApp } from '../../store/useApp'
import { Button, Card, Kicker, cx, lineInput } from '../../components/ui'

const schema = z.object({ password: z.string().min(1, 'Enter the password') })

// Hidden route: /admin. Not linked from anywhere on the site.
export default function AdminPage() {
  const { token, setToken } = useApp()
  const qc = useQueryClient()
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })
  const login = useMutation({
    mutationFn: (values) => api.post('/auth/login', values),
    onSuccess: ({ token }) => {
      setToken(token)
      qc.invalidateQueries()
    },
  })

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-sm p-8">
        <Link to="/" className="flex items-center gap-2.5 font-serif text-[24px]">
          <Logo className="size-8 shrink-0 text-moss" />
          Tharcharbu Puthagam
        </Link>
        <Kicker className="mt-6">Editors</Kicker>
        {token ? (
          <div className="mt-4 space-y-4">
            <p className="text-[15px] text-ink-2">You are signed in. Drafts and edit buttons are now visible.</p>
            <div className="flex gap-2">
              <Link to="/" className="rounded-[4px] bg-ink px-4 py-2 text-[14px] font-semibold text-paper">
                Go to the site
              </Link>
              <Link to="/admin/lists" className="rounded-[4px] border border-ink px-4 py-2 text-[14px] font-semibold">
                Master lists
              </Link>
              <Button variant="outline" onClick={() => (setToken(null), qc.invalidateQueries())}>
                Sign out
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit((v) => login.mutate(v))} className="mt-4 space-y-4">
            <input
              type="password"
              autoFocus
              autoComplete="current-password"
              placeholder="Password"
              {...register('password')}
              className={cx(lineInput, 'text-[17px]')}
            />
            {(formState.errors.password || login.isError) && (
              <p className="text-[13px] text-[#b4472e]">{formState.errors.password?.message || errorText(login.error)}</p>
            )}
            <Button type="submit" disabled={login.isPending} className="w-full">
              {login.isPending ? 'Checking…' : 'Sign in'}
            </Button>
          </form>
        )}
      </Card>
    </main>
  )
}

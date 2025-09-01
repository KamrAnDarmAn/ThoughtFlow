import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOutsideClick } from '@/hooks/use-outside-click';
import { useAuth } from '@/hooks/useAuth';

export const CloseIcon = () => (
  <motion.svg
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.05 } }}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-black"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </motion.svg>
);

const ProfileCard = ({ user, isFollowing, onFollow, onUnfollow, isOwnProfile }) => (
  <Card className="w-full md:w-[70%]">
    <CardHeader className="flex flex-row items-center gap-4">
      <Avatar className="w-20 h-20">
        {user?.avatar ? (
          <AvatarImage src={`/uploads/${user.avatar}`} alt={`${user.firstName} ${user.lastName}`} />
        ) : (
          <AvatarFallback>{user?.firstName[0]}{user?.lastName[0]}</AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1">
        <CardTitle>{user?.firstName} {user?.lastName}</CardTitle>
        <p className="font-semibold text-slate-300">@{user?.username}</p>
        <p className="text-sm text-slate-400">
          {user?.followers?.length || 0} Followers · {user?.following?.length || 0} Following
        </p>
      </div>
      {isOwnProfile ? (
        <Button variant="outline" onClick={() => window.location.href = '/my-profile'}>
          Edit Profile
        </Button>
      ) : (
        <Button
          variant={isFollowing ? 'outline' : 'default'}
          onClick={isFollowing ? onUnfollow : onFollow}
          className="font-semibold"
        >
          {isFollowing ? 'Unfollow' : 'Follow'}
        </Button>
      )}
    </CardHeader>
    <CardContent>
      <p className="text-slate-300">Bio: {user?.bio || 'No bio provided'}</p>
    </CardContent>
  </Card>
);

const BlogCard = ({ card, id, setActive }) => (
  <motion.div
    layoutId={`card-${card?.title}-${id}`}
    onClick={() => setActive(card)}
    className="p-4 flex flex-col dark:bg-neutral-900 bg-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
  >
    <div className="flex gap-4 flex-col w-full">
      <motion.div layoutId={`image-${card?.title}-${id}`}>
        <img
          width={100}
          height={100}
          src={card?.thumbnail ? `../../../api/${card.thumbnail}` : '/placeholder.jpg'}
          alt={card?.title}
          className="h-60 w-full rounded-lg object-cover object-top"
        />
      </motion.div>
      <div className="flex justify-center items-center flex-col">
        <motion.h3
          layoutId={`title-${card?.title}-${id}`}
          className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left text-base"
        >
          {card?.title}
        </motion.h3>
        <motion.p
          layoutId={`author-${card?.author.firstName}-${id}`}
          className="text-neutral-600 dark:text-neutral-400 text-center md:text-left text-base"
        >
          @{card?.author.username}
        </motion.p>
      </div>
    </div>
  </motion.div>
);

export const BlogModal = ({ active, id, setActive }) => {
  const ref = useRef(null);

  useOutsideClick(ref, () => {
    setActive(null);
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 h-full w-full z-[90] pointer-events-auto"
        onClick={() => {
          setActive(null);
        }}
      />
      <div className="fixed inset-0 grid place-items-center z-[100] pointer-events-none">
        <motion.button
          key={`button-${active.title}-${id}`}
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.05 } }}
          className="flex absolute top-2 right-2 items-center justify-center bg-white rounded-full h-6 w-6 z-[101] pointer-events-auto"
          onClick={() => {
            setActive(null);
          }}
        >
          <CloseIcon />
        </motion.button>
        <motion.div
          ref={ref}
          layoutId={`card-${active.title}-${id}`}
          className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden pointer-events-auto"
        >
          <motion.div layoutId={`image-${active.title}-${id}`}>
            <img
              width={200}
              height={200}
              src={active.thumbnail ? `../../../api/${active.thumbnail}` : '/placeholder.jpg'}
              alt={active.title}
              className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
            />
          </motion.div>
          <div>
            <div className="flex justify-between items-start p-4">
              <div>
                <motion.h3
                  layoutId={`title-${active.title}-${id}`}
                  className="font-medium text-neutral-700 dark:text-neutral-200 text-base"
                >
                  {active.title}
                </motion.h3>
                <motion.p
                  layoutId={`author-${active.author.firstName}-${id}`}
                  className="text-neutral-600 dark:text-neutral-400 text-base"
                >
                  @{active.author.username}
                </motion.p>
              </div>
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-4 py-3 text-sm rounded-full font-bold bg-green-500 text-white"
              >
                <Link to={`/posts/${active?.id}`}>Visit</Link>
              </motion.div>
            </div>
            <div className="pt-4 relative px-4">
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                dangerouslySetInnerHTML={{ __html: active?.summary }}
                className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

const Profile = ({ userId, isOwnProfile = false, userData }) => {
  const { user: currentUser, logout } = useAuth();
  const params = useParams();
  const effectiveUserId = isOwnProfile ? userId : params.userId;
  const [profileUser, setProfileUser] = useState(isOwnProfile ? userData : null);
  const [blogs, setBlogs] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [active, setActive] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(!isOwnProfile);
  const navigate = useNavigate();
  const id = useId();

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      if (isOwnProfile || !effectiveUserId) {
        if (!isOwnProfile && !effectiveUserId) {
          if (isMounted) {
            setError('Invalid user ID');
            setIsLoading(false);
          }
        }
        return;
      }

      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/users/${effectiveUserId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (isMounted) {
          setProfileUser(response.data.user);
          setIsFollowing(currentUser && response.data.user.followers.some(f => f.id === currentUser.id));
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to load profile';
        if (isMounted) {
          setError(message);
          toast.error(message);
          if (error.response?.status === 401) {
            logout();
            navigate('/login');
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const fetchBlogs = async () => {
      if (!effectiveUserId) return;
      try {
        const response = await axios.get(`http://localhost:5000/api/posts?authorId=${effectiveUserId}`);
        if (isMounted) setBlogs(response.data);
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to load posts';
        if (isMounted) {
          setError(message);
          toast.error(message);
        }
      }
    };

    if (effectiveUserId) {
      fetchProfile();
      fetchBlogs();
    } else {
      setError('No user ID provided');
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [effectiveUserId, isOwnProfile, currentUser?.id, navigate]);
  // }, [effectiveUserId, isOwnProfile, currentUser?.id, logout, navigate]);

  useEffect(() => {
    if (isOwnProfile && userData) {
      setIsFollowing(false); // Own profile doesn't show follow button
      setProfileUser(userData);
    }
  }, [isOwnProfile, userData]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setActive(null);
      }
    };
    if (active && typeof active === 'object') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active]);

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error('Please log in to follow users.');
      navigate('/login');
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/users/${effectiveUserId}/follow`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setIsFollowing(true);
      setProfileUser(prev => ({ ...prev, followers: [...(prev.followers || []), { id: currentUser.id }] }));
      toast.success(`You are now following @${profileUser.username}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to follow user';
      toast.error(message);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${effectiveUserId}/follow`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setIsFollowing(false);
      setProfileUser(prev => ({ ...prev, followers: prev.followers.filter(f => f.id !== currentUser.id) }));
      toast.success(`You have unfollowed @${profileUser.username}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to unfollow user';
      toast.error(message);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!profileUser) {
    return <div className="text-center">User not found</div>;
  }

  return (
    <main className="flex flex-col items-center mt-4 space-y-4 min-w-full">
      <div className='mt-10'></div>
      <AnimatePresence>
        {active && typeof active === 'object' && <BlogModal active={active} id={id} setActive={setActive} />}
      </AnimatePresence>
      <ProfileCard
        user={profileUser}
        isFollowing={isFollowing}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        isOwnProfile={isOwnProfile}
      />
      <Card className="w-full md:w-[70%] min-h-[200px] flex justify-center">
        <CardHeader>
          <CardTitle>{profileUser.firstName}'s Blogs</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[150px] w-full">
          {blogs.length === 0 ? (
            <div className="text-center space-y-4">
              <p className="text-lg text-neutral-700 dark:text-neutral-300">
                {isOwnProfile ? 'You haven’t created any posts yet.' : `${profileUser.firstName} hasn’t posted yet.`}
              </p>
              {isOwnProfile ? (
                <Button asChild>
                  <Link to="/create">Create Your First Post</Link>
                </Button>
              ) : !isFollowing && currentUser && currentUser.id !== profileUser.id ? (
                <Button onClick={handleFollow}>Follow @{profileUser.username}</Button>
              ) : null}
            </div>
          ) : (
            <ul className="max-w-2xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 items-start gap-4">
              {blogs.map((card) => (
                <BlogCard key={card.id} card={card} id={id} setActive={setActive} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default Profile;
import {
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  LogOut,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

import Button from '../../components/common/Button';

import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileStats from '../../components/profile/ProfileStats';
import UploadedDocuments from '../../components/profile/UploadedDocuments';
import SavedDocuments from '../../components/profile/SavedDocuments';
import EditProfileModal from '../../components/profile/EditProfileModal';
import EditDocumentModal from '../../components/profile/EditDocumentModal';
import DeleteDocumentModal from '../../components/profile/DeleteDocumentModal';

// =====================================================
// USER API
// =====================================================

import {
  getUserProfileApi,
  updateUserProfileApi,
  getMyDocumentsApi,
  getSavedDocumentsApi,
  clearUserProfileCache,
} from '../../services/user.api';

// =====================================================
// DOCUMENT API
// =====================================================

import {
  updateDocumentApi,
  deleteDocumentApi,
} from '../../services/document.api';

// =====================================================
// CATEGORY API
// =====================================================

import {
  getCategories,
} from '../../services/category.api';

// =====================================================
// AUTH API
// =====================================================

import {
  logoutApi,
} from '../../services/auth.api';

import {
  formatDate,
} from '../../utils/formatters';

import './Profile.css';

// =====================================================
// FORMAT FILE SIZE
// =====================================================

const formatFileSize = (bytes) => {
  const size =
    Number(bytes || 0);

  if (!size) {
    return '0 KB';
  }

  if (
    size >=
    1024 * 1024
  ) {
    return `${(
      size /
      (1024 * 1024)
    ).toFixed(2)} MB`;
  }

  return `${(
    size /
    1024
  ).toFixed(2)} KB`;
};

// =====================================================
// MAP BACKEND DOCUMENT → UI
// =====================================================

const mapBackendDocument = (doc) => ({
  id:
    doc.id ||
    doc.document_id,

  title:
    doc.title ||
    'Untitled Document',

  // UI cũ gọi là major,
  // Backend thật là Category.
  major:
    doc.category_title ||
    doc.categoryTitle ||
    doc.category_name ||
    doc.categoryName ||
    doc.category?.title ||
    doc.category?.name ||
    doc.document?.category_title ||
    doc.document?.categoryTitle ||
    doc.document?.category_name ||
    doc.document?.categoryName ||
    doc.document?.category?.title ||
    doc.document?.category?.name ||
    'Uncategorized',

  subject: '',

  fileSize:
    formatFileSize(
      doc.file_size
    ),

  uploadDate:
    doc.created_at,

  downloads:
    Number(
      doc.download_count
    ) || 0,

  categoryId:
    doc.category_id ||
    doc.document?.category_id,

  description:
    doc.description || '',

  fileType:
    doc.file_type,

  fileUrl:
    doc.file_url,

  status:
    doc.status,

  views:
    Number(
      doc.view_count
    ) || 0,

  reviewCount:
    Number(
      doc.review_count
    ) || 0,

  averageRating:
    Number(
      doc.average_rating
    ) || 0,

  uploaderName:
    doc.uploader_name ||
    doc.full_name ||
    '',
});

// =====================================================
// PROFILE
// =====================================================

export const Profile = () => {
  const navigate =
    useNavigate();

  // ===================================================
  // USER PROFILE
  // ===================================================

  const [
    userProfile,
    setUserProfile,
  ] = useState(null);

  const [
    isLoadingProfile,
    setIsLoadingProfile,
  ] = useState(true);

  const [
    profileFetchError,
    setProfileFetchError,
  ] = useState('');

  // ===================================================
  // GET PROFILE
  // ===================================================

  useEffect(() => {
    const fetchUserProfile =
      async () => {
        setIsLoadingProfile(true);
        setProfileFetchError('');

        try {
          const response =
            await getUserProfileApi();

          console.log(
            'Profile API response:',
            response
          );

          const profile =
            response.user ||
            response.data ||
            response;

          const fullName =
            profile.fullName ||
            profile.full_name ||
            '';

          setUserProfile({
            id:
              profile.id ||
              profile.user_id ||
              null,

            fullName,

            email:
              profile.email ||
              '',

            avatar:
              profile.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                fullName ||
                'User'
              )}`,

            role:
              profile.role ||
              '',

            joinedDate:
              profile.joinedDate ||
              profile.joined_date ||
              profile.created_at ||
              '',
          });
        } catch (error) {
          console.error(
            'Profile API error:',
            error
          );

          setUserProfile(null);

          setProfileFetchError(
            error.response
              ?.data
              ?.message ||
            'Unable to load profile.'
          );
        } finally {
          setIsLoadingProfile(
            false
          );
        }
      };

    fetchUserProfile();
  }, []);

  // ===================================================
  // MY UPLOADED DOCUMENTS
  // ===================================================

  const [
    uploadedDocs,
    setUploadedDocs,
  ] = useState([]);

  const loadMyDocuments =
    useCallback(
      async () => {
        try {
          const response =
            await getMyDocumentsApi();

          console.log(
            'My Documents API response:',
            response
          );

          const documents =
            response.documents ||
            response.data ||
            [];

          setUploadedDocs(
            documents.map(
              mapBackendDocument
            )
          );
        } catch (error) {
          console.error(
            'My Documents API error:',
            error
          );

          setUploadedDocs([]);
        }
      },
      []
    );

  useEffect(() => {
    loadMyDocuments();
  }, [loadMyDocuments]);

  // ===================================================
  // SAVED DOCUMENTS
  // ===================================================

  const [
    savedDocs,
    setSavedDocs,
  ] = useState([]);

  const [
    isLoadingSavedDocs,
    setIsLoadingSavedDocs,
  ] = useState(true);

  const [
    savedDocsError,
    setSavedDocsError,
  ] = useState('');

  const loadSavedDocuments =
    useCallback(
      async () => {
        setIsLoadingSavedDocs(
          true
        );

        setSavedDocsError('');

        try {
          const response =
            await getSavedDocumentsApi();

          console.log(
            'Saved Documents API response:',
            response
          );

          const documents =
            response.savedDocuments ||
            response.documents ||
            response.data?.savedDocuments ||
            response.data?.documents ||
            (
              Array.isArray(
                response.data
              )
                ? response.data
                : []
            );

          setSavedDocs(
            documents.map(
              mapBackendDocument
            )
          );
        } catch (error) {
          console.error(
            'Saved Documents API error:',
            error
          );

          setSavedDocs([]);

          setSavedDocsError(
            error.response
              ?.data
              ?.message ||
            'Unable to load saved documents.'
          );
        } finally {
          setIsLoadingSavedDocs(
            false
          );
        }
      },
      []
    );

  useEffect(() => {
    loadSavedDocuments();
  }, [loadSavedDocuments]);

  // ===================================================
  // CATEGORIES
  // ===================================================

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    isLoadingCategories,
    setIsLoadingCategories,
  ] = useState(false);

  useEffect(() => {
    const fetchCategories =
      async () => {
        setIsLoadingCategories(
          true
        );

        try {
          const response =
            await getCategories();

          console.log(
            'Profile Category API response:',
            response
          );

          const data =
            response.data ||
            response.categories ||
            [];

          setCategories(
            Array.isArray(data)
              ? data
              : []
          );
        } catch (error) {
          console.error(
            'Category API error:',
            error
          );

          setCategories([]);
        } finally {
          setIsLoadingCategories(
            false
          );
        }
      };

    fetchCategories();
  }, []);

  // ===================================================
  // CATEGORY ID → CATEGORY NAME
  // ===================================================

  const getCategoryName = (
    categoryId,
    fallback
  ) => {
    const category =
      categories.find(
        (item) =>
          item.id === categoryId
      );

    return (
      category?.title ||
      category?.name ||
      category?.slug ||
      fallback ||
      'Uncategorized'
    );
  };

  // ===================================================
  // EDIT PROFILE STATE
  // ===================================================

  const [
    editProfileOpen,
    setEditProfileOpen,
  ] = useState(false);

  const [
    profileDraft,
    setProfileDraft,
  ] = useState({
    fullName: '',
    email: '',
    avatar: '',
  });

  const [
    profileError,
    setProfileError,
  ] = useState('');

  const [
    profileSuccess,
    setProfileSuccess,
  ] = useState('');

  const [
    isSavingProfile,
    setIsSavingProfile,
  ] = useState(false);

  // ===================================================
  // EDIT DOCUMENT STATE
  // ===================================================

  const [
    editDocModal,
    setEditDocModal,
  ] = useState(null);

  const [
    docDraft,
    setDocDraft,
  ] = useState({
    title: '',
    description: '',
    categoryId: '',
  });

  const [
    docError,
    setDocError,
  ] = useState('');

  const [
    isSavingDoc,
    setIsSavingDoc,
  ] = useState(false);

  // ===================================================
  // DELETE DOCUMENT STATE
  // ===================================================

  const [
    deleteModalDoc,
    setDeleteModalDoc,
  ] = useState(null);

  const [
    isDeletingDoc,
    setIsDeletingDoc,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] = useState('');

  // ===================================================
  // LOGOUT
  // ===================================================

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  // ===================================================
  // OPEN EDIT PROFILE
  // ===================================================

  const handleOpenEditProfile =
    () => {
      if (!userProfile) {
        return;
      }

      setProfileDraft({
        fullName:
          userProfile.fullName ||
          '',

        email:
          userProfile.email ||
          '',

        avatar:
          userProfile.avatar ||
          '',
      });

      setProfileError('');

      setEditProfileOpen(
        true
      );
    };

  // ===================================================
  // PATCH PROFILE
  // ===================================================

  const handleSaveProfile =
    async (e) => {
      if (e) {
        e.preventDefault();
      }

      const fullName =
        String(
          profileDraft.fullName ||
          ''
        ).trim();

      const email =
        String(
          profileDraft.email ||
          ''
        ).trim();

      const avatar =
        String(
          profileDraft.avatar ||
          ''
        ).trim();

      if (!fullName) {
        setProfileError(
          'Full Name is required.'
        );

        return;
      }

      if (isSavingProfile) {
        return;
      }

      setIsSavingProfile(
        true
      );

      setProfileError('');

      try {
        const userData = {
          fullName,
          email,
          avatar,
        };

        const response =
          await updateUserProfileApi(
            userData
          );

        console.log(
          'Update Profile API response:',
          response
        );

        // updateUserProfileApi đã clear cache.
        // GET lại profile thật.
        const profileResponse =
          await getUserProfileApi();

        const updatedProfile =
          profileResponse.user ||
          profileResponse.data ||
          profileResponse;

        setUserProfile(
          (prev) => ({
            ...prev,

            fullName:
              updatedProfile.fullName ||
              updatedProfile.full_name ||
              fullName,

            email:
              updatedProfile.email ||
              email ||
              prev.email,

            avatar:
              updatedProfile.avatar ||
              avatar ||
              prev.avatar,

            role:
              updatedProfile.role ||
              prev.role,

            joinedDate:
              updatedProfile.joinedDate ||
              updatedProfile.joined_date ||
              updatedProfile.created_at ||
              prev.joinedDate,
          })
        );

        setEditProfileOpen(
          false
        );

        setProfileSuccess(
          response.message ||
          'Profile updated successfully!'
        );

        setTimeout(() => {
          setProfileSuccess('');
        }, 3000);
      } catch (error) {
        console.error(
          'Update Profile API error:',
          error
        );

        setProfileError(
          error.response
            ?.data
            ?.message ||
          'Unable to update profile.'
        );
      } finally {
        setIsSavingProfile(
          false
        );
      }
    };

  // ===================================================
  // OPEN EDIT DOCUMENT
  // ===================================================

  const handleOpenEditDoc =
    (doc) => {
      setEditDocModal(doc);

      setDocDraft({
        title:
          doc.title || '',

        description:
          doc.description || '',

        categoryId:
          doc.categoryId || '',
      });

      setDocError('');
    };

  // ===================================================
  // PATCH DOCUMENT
  // ===================================================

  const handleSaveDoc =
    async (e) => {
      if (e) {
        e.preventDefault();
      }

      if (!editDocModal) {
        return;
      }

      const title =
        String(
          docDraft.title ||
          ''
        ).trim();

      const description =
        String(
          docDraft.description ||
          ''
        ).trim();

      if (!title) {
        setDocError(
          'Document title is required.'
        );

        return;
      }

      if (!docDraft.categoryId) {
        setDocError(
          'Document category is required.'
        );

        return;
      }

      if (isSavingDoc) {
        return;
      }

      setIsSavingDoc(true);
      setDocError('');

      try {
        const documentData = {
          title,
          description,

          categoryId:
            docDraft.categoryId,
        };

        console.log(
          'Update Document payload:',
          documentData
        );

        const response =
          await updateDocumentApi(
            editDocModal.id,
            documentData
          );

        console.log(
          'Update Document API response:',
          response
        );

        await loadMyDocuments();

        setEditDocModal(null);

        setProfileSuccess(
          response.message ||
          'Document updated successfully!'
        );

        setTimeout(() => {
          setProfileSuccess('');
        }, 3000);
      } catch (error) {
        console.error(
          'Update Document API error:',
          error
        );

        setDocError(
          error.response
            ?.data
            ?.message ||
          'Unable to update document.'
        );
      } finally {
        setIsSavingDoc(false);
      }
    };

  // ===================================================
  // DELETE DOCUMENT
  // ===================================================

  const handleOpenDeleteDoc =
    (doc) => {
      setDeleteError('');
      setDeleteModalDoc(doc);
    };

  const handleConfirmDelete =
    async () => {
      if (
        !deleteModalDoc ||
        isDeletingDoc
      ) {
        return;
      }

      setIsDeletingDoc(true);
      setDeleteError('');

      try {
        const response =
          await deleteDocumentApi(
            deleteModalDoc.id
          );

        console.log(
          'Delete Document API response:',
          response
        );

        await Promise.all([
          loadMyDocuments(),
          loadSavedDocuments(),
        ]);

        setDeleteModalDoc(null);

        setProfileSuccess(
          response.message ||
          'Document deleted successfully!'
        );

        setTimeout(() => {
          setProfileSuccess('');
        }, 3000);
      } catch (error) {
        console.error(
          'Delete Document API error:',
          error
        );

        setDeleteError(
          error.response
            ?.data
            ?.message ||
          'Unable to delete document.'
        );
      } finally {
        setIsDeletingDoc(false);
      }
    };

  const handleCloseDeleteModal =
    () => {
      if (isDeletingDoc) {
        return;
      }

      setDeleteModalDoc(null);
      setDeleteError('');
    };

  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout =
    async () => {
      if (isLoggingOut) {
        return;
      }

      setIsLoggingOut(true);

      try {
        const response =
          await logoutApi();

        console.log(
          'Logout API response:',
          response
        );

        // Session đã hết.
        // Không được giữ profile cache cũ.
        clearUserProfileCache();

        navigate('/login');
      } catch (error) {
        console.error(
          'Logout API error:',
          error
        );
      } finally {
        setIsLoggingOut(false);
      }
    };

  // ===================================================
  // PROFILE STATS THẬT
  // ===================================================

  const totalDownloadsReceived =
    uploadedDocs.reduce(
      (total, doc) =>
        total +
        Number(
          doc.downloads || 0
        ),
      0
    );

  const totalReviewCount =
    uploadedDocs.reduce(
      (total, doc) =>
        total +
        Number(
          doc.reviewCount || 0
        ),
      0
    );

  const totalWeightedRating =
    uploadedDocs.reduce(
      (total, doc) =>
        total +
        (
          Number(
            doc.averageRating || 0
          ) *
          Number(
            doc.reviewCount || 0
          )
        ),
      0
    );

  const averageMaterialRating =
    totalReviewCount > 0
      ? (
        totalWeightedRating /
        totalReviewCount
      ).toFixed(1)
      : '0.0';

  // ===================================================
  // PROFILE LOADING STATE
  // ===================================================

  if (isLoadingProfile) {
    return (
      <div className="payt-profile-page">

        <div className="container profile-body-container">

          <div className="payt-card">

            Loading profile...

          </div>

        </div>

      </div>
    );
  }

  // ===================================================
  // PROFILE ERROR STATE
  // ===================================================

  if (
    profileFetchError ||
    !userProfile
  ) {
    return (
      <div className="payt-profile-page">

        <div className="container profile-body-container">

          <div className="payt-card">

            <AlertTriangle
              size={36}
              className="warning-icon"
            />

            <h2>
              Unable to load profile
            </h2>

            <p>
              {
                profileFetchError ||
                'Profile data is unavailable.'
              }
            </p>

            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                navigate('/login')
              }
            >
              Back to Login
            </Button>

          </div>

        </div>

      </div>
    );
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="payt-profile-page">

      {/* =================================================
          PROFILE BANNER
      ================================================= */}

      <ProfileHeader
        userProfile={userProfile}
        onEditProfile={handleOpenEditProfile}
        onUploadMaterial={() => navigate('/upload')}
        variant="banner"
      />

      {/* =================================================
          PROFILE BODY
      ================================================= */}

      <div className="container profile-body-container">

        {/* SUCCESS */}

        {profileSuccess && (

          <div className="profile-success-alert">

            <CheckCircle2
              size={18}
              className="success-icon"
            />

            <span>
              {profileSuccess}
            </span>

          </div>

        )}

        {/* =================================================
            STATS
        ================================================= */}

        <ProfileStats
          uploadedCount={uploadedDocs.length}
          totalDownloads={totalDownloadsReceived}
          averageRating={averageMaterialRating}
        />

        {/* =================================================
            ACCOUNT INFORMATION
        ================================================= */}

        <ProfileHeader
          userProfile={userProfile}
          onEditProfile={handleOpenEditProfile}
          variant="info"
        />

        {/* =================================================
            MY UPLOADED DOCUMENTS
        ================================================= */}

        <UploadedDocuments
          uploadedDocs={uploadedDocs}
          getCategoryName={getCategoryName}
          onUploadMaterial={() => navigate('/upload')}
          onEditDoc={handleOpenEditDoc}
          onDeleteDoc={handleOpenDeleteDoc}
        />

        {/* =================================================
            SAVED DOCUMENTS
        ================================================= */}

        <SavedDocuments
          savedDocs={savedDocs}
          isLoadingSavedDocs={isLoadingSavedDocs}
          savedDocsError={savedDocsError}
          getCategoryName={getCategoryName}
          onBrowseDocuments={() => navigate('/documents')}
        />

        {/* =================================================
            LOGOUT
        ================================================= */}

        <div className="profile-account-footer-actions">

          <Button
            variant="danger"
            size="md"
            icon={LogOut}
            onClick={
              handleLogout
            }
            loading={
              isLoggingOut
            }
          >

            {
              isLoggingOut
                ? 'Logging out...'
                : 'Logout Account'
            }

          </Button>

        </div>

      </div>

      {/* =================================================
          DELETE DOCUMENT MODAL
      ================================================= */}

      <DeleteDocumentModal
        isOpen={!!deleteModalDoc}
        deleteModalDoc={deleteModalDoc}
        isDeletingDoc={isDeletingDoc}
        deleteError={deleteError}
        onClose={handleCloseDeleteModal}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* =================================================
          EDIT PROFILE MODAL
      ================================================= */}

      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={() => {
          if (!isSavingProfile) {
            setEditProfileOpen(false);
            setProfileError('');
          }
        }}
        profileDraft={profileDraft}
        setProfileDraft={setProfileDraft}
        userProfile={userProfile}
        profileError={profileError}
        setProfileError={setProfileError}
        isSavingProfile={isSavingProfile}
        onSaveProfile={handleSaveProfile}
      />

      {/* =================================================
          EDIT DOCUMENT MODAL
      ================================================= */}

      <EditDocumentModal
        isOpen={!!editDocModal}
        editDocModal={editDocModal}
        onClose={() => {
          if (!isSavingDoc) {
            setEditDocModal(null);
            setDocError('');
          }
        }}
        docDraft={docDraft}
        setDocDraft={setDocDraft}
        docError={docError}
        setDocError={setDocError}
        isSavingDoc={isSavingDoc}
        isLoadingCategories={isLoadingCategories}
        categories={categories}
        onSaveDoc={handleSaveDoc}
      />

    </div>
  );
};

export default Profile;
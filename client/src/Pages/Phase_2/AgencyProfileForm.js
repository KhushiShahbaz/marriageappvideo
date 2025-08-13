// src/components/AgencyCreate.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from "../../Components/Layout/Input";
import { Button } from "../../Components/Layout/Button";
import { Label } from '../../Components/Layout/Label';
import ImagePicker from '../../Components/Layout/ImagePicker';
import { createAgency, fetchAgencyById, updateAgency } from '../../slice/agencySlice';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
    Building2, 
    Phone, 
    MapPin, 
    FileText, 
    Calendar, 
    IdCard, 
    CreditCard,
    Save,
    X,
    Upload,
    CheckCircle,
    AlertCircle
  } from 'lucide-react';

export const AgencyProfile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        businessNo: '',
        cnicNo: '',
        licenseNo: '',
        yearOfExp: '',
        verification: 'pending',
        contactNo: '',
        address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: ''
        },
        images: [],
        profile: '',
        isVerified: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState({});
    const { id } = useParams();
    const[edit,setEdit]=useState(false)
const dispatch=useDispatch()
const steps = [
    { id: 1, title: 'Basic Info', icon: Building2 },
    { id: 2, title: 'Contact & Address', icon: MapPin },
    { id: 3, title: 'Documents & Media', icon: FileText }
];

const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
};

const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
};
    // Validation rules
    const validate = () => {
        const newErrors = {};
        
        // Agency Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Agency name is required';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Agency name must be at least 3 characters';
        }

        // Business Number validation
        if (!formData.businessNo.trim()) {
            newErrors.businessNo = 'Business number is required';
        } else if (!/^[0-9]{10,15}$/.test(formData.businessNo)) {
            newErrors.businessNo = 'Business number must be 10-15 digits';
        }

        // CNIC validation (if provided)
        if (formData.cnicNo && !/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/.test(formData.cnicNo)) {
            newErrors.cnicNo = 'CNIC must be in format 12345-1234567-1';
        }

        // License Number validation
        if (!formData.licenseNo.trim()) {
            newErrors.licenseNo = 'License number is required';
        }

        // Years of Experience validation
        if (!formData.yearOfExp) {
            newErrors.yearOfExp = 'Years of experience is required';
        } else if (isNaN(formData.yearOfExp)) {
            newErrors.yearOfExp = 'Must be a number';
        } else if (formData.yearOfExp < 0 || formData.yearOfExp > 100) {
            newErrors.yearOfExp = 'Must be between 0 and 100';
        }

        // Contact Number validation
        if (!formData.contactNo.trim()) {
            newErrors.contactNo = 'Contact number is required';
        } else if (!/^[0-9+]{11,15}$/.test(formData.contactNo)) {
            newErrors.contactNo = 'Invalid contact number format';
        }

        // Address validations
        if (!formData.address.street.trim()) {
            newErrors['address.street'] = 'Street address is required';
        }

        if (!formData.address.city.trim()) {
            newErrors['address.city'] = 'City is required';
        }

        if (!formData.address.country.trim()) {
            newErrors['address.country'] = 'Country is required';
        }

        // Profile description validation
        if (formData.profile && formData.profile.length > 500) {
            newErrors.profile = 'Profile description must be less than 500 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    useEffect(() => {
        if (id) {
          dispatch(fetchAgencyById(id))
            .unwrap()
            .then((res) => {
                setEdit(true)
                setFormData(res?.data)
            })
            .catch((error) => console.error("Error fetching profile:", error));
        }
      }, [id, dispatch]);
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            validate();
        }
    }, [formData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
    
        if (name.includes('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // If you want to send as FormData (for file uploads)
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === "address") {
                    // For nested address object, append each field
                    Object.entries(value).forEach(([addrKey, addrValue]) => {
                        data.append(`address[${addrKey}]`, addrValue);
                    });
                } else if (key === "images" && Array.isArray(value)) {
                    // For images array, append each file
                    value.forEach((file, idx) => {
                        data.append(`images`, file);
                    });
                } else {
                    data.append(key, value);
                }
            });
            if (id && edit) {
                await dispatch(updateAgency({ id: id, updates: data })).finally((res)=>{
                    toast.success("Profile updated successfully!");
                });
              } else {
             const response =  await dispatch(createAgency(data)).finally((res)=>{
                toast.success("Profile created successfully!");
             });
        
              }
              navigate("/agency/profile");
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to format CNIC
    const formatCNIC = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5);
        }
        if (value.length > 13) {
            value = value.substring(0, 13) + '-' + value.substring(13);
        }
        if (value.length > 15) {
            value = value.substring(0, 15);
        }
        setFormData(prev => ({
            ...prev,
            cnicNo: value
        }));
    };

    // Helper function to format phone number
    const formatPhone = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            value = '+' + value;
        }
        if (value.length > 15) {
            value = value.substring(0, 15);
        }
        setFormData(prev => ({
            ...prev,
            contactNo: value
        }));
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 py-8 px-4'>
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    {id ? "✏️ Edit Agency Profile" : "🏢 Create Your Agency Profile"}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                    {id ? "Update your agency information" : "Join our platform and start connecting hearts"}
                </p>
            </motion.div>

            {/* Progress Steps */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-12"
            >
                <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                                currentStep === step.id 
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                                    : currentStep > step.id
                                    ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                                    : 'text-gray-400'
                            }`}>
                                <step.icon className="w-5 h-5" />
                                <span className="font-medium">{step.title}</span>
                                {currentStep > step.id && <CheckCircle className="w-4 h-4" />}
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`h-0.5 w-8 ${currentStep > step.id ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-600'} transition-colors duration-300`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </motion.div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6 flex items-center"
                >
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                    <span className="text-red-700 dark:text-red-400">{error}</span>
                </motion.div>
            )}

            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
            >
                <form className="p-8">
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center mb-6">
                                <Building2 className="w-6 h-6 text-purple-500 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Basic Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                                        <Building2 className="w-4 h-4 mr-2" />
                                        Agency Name *
                                    </Label>
                                    <Input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="rounded-xl border-2 focus:border-purple-500 transition-all duration-300"
                                        placeholder="Enter your agency name"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Business Number *
                                    </Label>
                                    <Input
                                        type="text"
                                        name="businessNo"
                                        value={formData.businessNo}
                                        onChange={handleChange}
                                        className="rounded-xl border-2 focus:border-purple-500 transition-all duration-300"
                                        placeholder="Enter business registration number"
                                    />
                                    {errors.businessNo && (
                                        <p className="text-red-500 text-sm flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.businessNo}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                                        <IdCard className="w-4 h-4 mr-2" />
                                        CNIC Number *
                                    </Label>
                                    <Input
                                        type="text"
                                        name="cnicNo"
                                        value={formData.cnicNo}
                                        onChange={formatCNIC}
                                        className="rounded-xl border-2 focus:border-purple-500 transition-all duration-300"
                                        placeholder="12345-1234567-1"
                                        maxLength={15}
                                    />
                                    {errors.cnicNo && (
                                        <p className="text-red-500 text-sm flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.cnicNo}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                                        <FileText className="w-4 h-4 mr-2" />
                                        License Number *
                                    </Label>
                                    <Input
                                        type="text"
                                        name="licenseNo"
                                        value={formData.licenseNo}
                                        onChange={handleChange}
                                        className="rounded-xl border-2 focus:border-purple-500 transition-all duration-300"
                                        placeholder="Enter license number"
                                    />
                                    {errors.licenseNo && (
                                        <p className="text-red-500 text-sm flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.licenseNo}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Years of Experience *
                                    </Label>
                                    <Input
                                        type="number"
                                        name="yearOfExp"
                                        value={formData.yearOfExp}
                                        onChange={handleChange}
                                        className="rounded-xl border-2 focus:border-purple-500 transition-all duration-300"
                                        placeholder="0"
                                        min="0"
                                    />
                                    {errors.yearOfExp && (
                                        <p className="text-red-500 text-sm flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.yearOfExp}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Profile Description
                                </Label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:bg-gray-700 dark:text-white transition-all duration-300 resize-none"
                                    placeholder="Tell us about your agency, services, and what makes you special..."
                                    maxLength={500}
                                />
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>{formData.description?.length || 0}/500 characters</span>
                                    {errors.description && (
                                        <span className="text-red-500 flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.description}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Contact & Address */}
                    {currentStep === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center mb-6">
                                <MapPin className="w-6 h-6 text-purple-500 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact & Address</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                                        <Phone className="w-4 h-4 mr-2" />
                                        Contact Number *
                                    </Label>
                                    <Input
                                        type="tel"
                                        name="contactNo"
                                        value={formData.contactNo}
                                        onChange={formatPhone}
                                        className="rounded-xl border-2 focus:border-purple-500 transition-all duration-300"
                                        placeholder="+1234567890"
                                    />
                                    {errors.contactNo && (
                                        <p className="text-red-500 text-sm flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.contactNo}
                                        </p>
                                    )}
                                </div>

                               

                                <div className="space-y-2 md:col-span-2">
                                    <Label className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        Street Address *
                                    </Label>
                                    <Input
                                        type="text"
                                        name="address.street"
                                        value={formData.address.street}
                                        onChange={handleChange}
                                        className="rounded-xl border-2 focus:border-purple-500 transition-all duration-300"
                                        placeholder="123 Main Street, Suite 100"
                                    />
                                    {errors['address.street'] && (
                                        <p className="text-red-500 text-sm flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors['address.street']}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700 dark:text-gray-300 font-medium">
                                        City *
                                    </Label>
                                    <Input
                                        type="text"
                                        name="address.city"
                                        value={formData.address.city}
                                        onChange={handleChange}
                                        className="rounded-xl border-2 focus:border-purple-500 transition-all duration-300"
                                        placeholder="New York"
                                    />
                                    {errors['address.city'] && (
                                        <p className="text-red-500 text-sm flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors['address.city']}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700 dark:text-gray-300 font-medium">
                                        State/Province
                                    </Label>
                                    <Input
                                        type="text"
                                        name="address.state"
                                        value={formData.address.state}
                                        onChange={handleChange}
                                        className="rounded-xl border-2 focus:border-purple-500 transition-all duration-300"
                                        placeholder="NY"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700 dark:text-gray-300 font-medium">
                                        Postal Code
                                    </Label>
                                    <Input
                                        type="text"
                                        name="address.postalCode"
                                        value={formData.address.postalCode}
                                        onChange={handleChange}
                                        className="rounded-xl border-2 focus:border-purple-500 transition-all duration-300"
                                        placeholder="10001"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700 dark:text-gray-300 font-medium">
                                        Country *
                                    </Label>
                                    <Input
                                        type="text"
                                        name="address.country"
                                        value={formData.address.country}
                                        onChange={handleChange}
                                        className="rounded-xl border-2 focus:border-purple-500 transition-all duration-300"
                                        placeholder="United States"
                                    />
                                    {errors['address.country'] && (
                                        <p className="text-red-500 text-sm flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors['address.country']}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Documents & Media */}
                    {currentStep === 3 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center mb-6">
                                <Upload className="w-6 h-6 text-purple-500 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Documents & Media</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6">
                                    <Label className="flex items-center text-gray-700 dark:text-gray-300 font-medium mb-4">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Agency Images & Documents
                                    </Label>
                                    <ImagePicker
                                        multiple={true}
                                        onImageSelect={(images) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                images: images
                                            }));
                                        }}
                                        maxImages={5}
                                        className="rounded-xl"
                                    />
                                    <p className="text-sm text-gray-500 mt-2">
                                        Upload up to 5 images of your agency, office, or relevant documents
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div>
                            {currentStep > 1 && (
                                <motion.button
                                    type="button"
                                    onClick={prevStep}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                                >
                                    ← Previous
                                </motion.button>
                            )}
                        </div>

                        <div className="flex space-x-4">
                            <motion.button
                                type="button"
                                onClick={() => navigate('/user/profile')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </motion.button>

                            {currentStep < 3 ? (
                                <motion.button
                                    type="button"
                                    onClick={nextStep}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
                                >
                                    Next →
                                </motion.button>
                            ) : (
                                <motion.button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    whileHover={{ scale: loading ? 1 : 1.02 }}
                                    whileTap={{ scale: loading ? 1 : 0.98 }}
                                    className="flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                            {id ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            {id ? 'Update Agency' : 'Create Agency'}
                                        </>
                                    )}
                                </motion.button>
                            )}
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    </div>
    );
};
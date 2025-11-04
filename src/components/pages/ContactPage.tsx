import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import { contactService } from '../../services/contact.service';

export function ContactPage() {
  const { language, t } = useLanguage();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await contactService.createContact(formData);
      toast.success(t('contact.form.success'));
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      console.error('Failed to submit contact form:', error);
      toast.error(error?.message || (language === 'ko' ? '문의 제출에 실패했습니다' : 'Failed to submit inquiry'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-black pt-24 sm:pt-32 pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 sm:mb-12 text-center"
        >
          <h1 className="text-white mb-4">{t('contact.title')}</h1>
          <p className="text-white/70 max-w-2xl mx-auto px-4">
            {t('contact.description')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8">
              <h2 className="text-white mb-6">{t('contact.form.title')}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-white/70 mb-2 text-sm sm:text-base">
                    {t('contact.form.name')}
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#5842FF]"
                    placeholder={t('contact.form.name.placeholder')}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-white/70 mb-2 text-sm sm:text-base">
                    {t('contact.form.email')}
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#5842FF]"
                    placeholder={t('contact.form.email.placeholder')}
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-white/70 mb-2 text-sm sm:text-base">
                    {t('contact.form.subject')}
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#5842FF]"
                    placeholder={t('contact.form.subject.placeholder')}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-white/70 mb-2 text-sm sm:text-base">
                    {t('contact.form.message')}
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#5842FF] resize-none"
                    placeholder={t('contact.form.message.placeholder')}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#5842FF] hover:bg-[#5842FF]/80 text-white disabled:opacity-50"
                >
                  {isSubmitting 
                    ? (language === 'ko' ? '제출 중...' : 'Submitting...') 
                    : t('contact.form.submit')
                  }
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8">
              <h2 className="text-white mb-8">{t('contact.info.title')}</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#5842FF]/10 border border-[#5842FF]/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#5842FF]" />
                  </div>
                  <div>
                    <h3 className="text-white mb-1 text-sm sm:text-base">{t('contact.info.email')}</h3>
                    <a 
                      href="mailto:info@lupl.kr" 
                      className="text-white/70 hover:text-[#5842FF] transition-colors text-sm sm:text-base"
                    >
                      info@lupl.kr
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#5842FF]/10 border border-[#5842FF]/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#5842FF]" />
                  </div>
                  <div>
                    <h3 className="text-white mb-1 text-sm sm:text-base">{t('contact.info.phone')}</h3>
                    <a 
                      href="tel:+82-2-1234-5678" 
                      className="text-white/70 hover:text-[#5842FF] transition-colors text-sm sm:text-base"
                    >
                      +82-2-1234-5678
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#5842FF]/10 border border-[#5842FF]/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#5842FF]" />
                  </div>
                  <div>
                    <h3 className="text-white mb-1 text-sm sm:text-base">{t('contact.info.address')}</h3>
                    <p className="text-white/70 text-sm sm:text-base">
                      {t('contact.info.address.value')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}